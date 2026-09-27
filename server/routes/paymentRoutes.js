const express = require("express");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const transporter = require("../utils/sendEmail");

const router = express.Router();

const TRON_API_URL =
  process.env.TRON_API_URL || "https://api.trongrid.io";

const USDT_CONTRACT_HEX =
  "41a614f803b6fd780986a42c78ec9c7f77e6ded13c";

const TRC20_TRANSFER_SELECTOR = "a9059cbb";

const base58Alphabet =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const decodeBase58Address = (address) => {
  let value = 0n;

  for (const character of address) {
    const index = base58Alphabet.indexOf(character);

    if (index === -1) {
      throw new Error("Invalid TRON address");
    }

    value = value * 58n + BigInt(index);
  }

  let hex = value.toString(16);

  if (hex.length % 2 !== 0) {
    hex = `0${hex}`;
  }

  hex = hex.padStart(50, "0");

  return hex.slice(0, 42).toLowerCase();
};

const getTransactionData = async (transactionHash) => {
  const transactionResponse = await fetch(
    `${TRON_API_URL}/wallet/gettransactionbyid`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: transactionHash,
      }),
    }
  );

  if (!transactionResponse.ok) {
    throw new Error(
      `TRON transaction request failed with status ${transactionResponse.status}`
    );
  }

  const transaction = await transactionResponse.json();

  if (!transaction || !transaction.txID) {
    return null;
  }

  const infoResponse = await fetch(
    `${TRON_API_URL}/wallet/gettransactioninfobyid`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: transactionHash,
      }),
    }
  );

  if (!infoResponse.ok) {
    throw new Error(
      `TRON transaction information request failed with status ${infoResponse.status}`
    );
  }

  const transactionInfo = await infoResponse.json();

  return {
    transaction,
    transactionInfo,
  };
};

const extractTransferDetails = ({
  transaction,
  transactionInfo,
}) => {
  const contract =
    transaction?.raw_data?.contract?.[0];

  if (
    !contract ||
    contract.type !== "TriggerSmartContract"
  ) {
    return null;
  }

  const parameter =
    contract.parameter?.value;

  if (!parameter) {
    return null;
  }

  const contractAddress =
    String(
      parameter.contract_address || ""
    ).toLowerCase();

  if (
    contractAddress !==
    USDT_CONTRACT_HEX
  ) {
    return null;
  }

  const data = String(
    parameter.data || ""
  ).toLowerCase();

  if (
    !data.startsWith(
      TRC20_TRANSFER_SELECTOR
    )
  ) {
    return null;
  }

  const transferData =
    data.slice(8);

  if (transferData.length < 128) {
    return null;
  }

  const recipientHex =
    `41${transferData.slice(24, 64)}`;

  const amountHex =
    transferData.slice(64, 128);

  const amountRaw =
    BigInt(`0x${amountHex}`);

  return {
    recipient:
      recipientHex.toLowerCase(),

    amountRaw,

    amountUSDT:
      Number(amountRaw) / 1_000_000,

    eventLogs:
      transactionInfo?.log || [],
  };
};

/*
 * Step 136:
 * Return payment history for the logged-in user only.
 */
router.get(
  "/history",
  authMiddleware,
  async (req, res) => {
    try {
      const payments =
        await Payment.find({
          user: req.user.userId,
        })
          .select(
            "paymentReference amount currency asset status transactionHash paidAt failureReason createdAt expiresAt"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        payments,
      });
    } catch (error) {
      console.error(
        "Get payment history error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load payment history.",
      });
    }
  }
);

router.post(
  "/create",
  authMiddleware,
  async (req, res) => {
    try {
      const amount =
        Number(req.body.amount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          message:
            "A valid payment amount is required",
        });
      }

      const network =
        process.env.PAYMENT_NETWORK;

      const asset =
        process.env.PAYMENT_ASSET;

      const receivingWallet =
        process.env.PAYMENT_RECEIVING_WALLET;

      if (
        !network ||
        !asset ||
        !receivingWallet
      ) {
        return res.status(500).json({
          message:
            "Crypto payment configuration is incomplete",
        });
      }

      const paymentReference =
        `SPV-${crypto.randomUUID()}`;

      const payment =
        await Payment.create({
          user: req.user.userId,
          paymentType: "crypto",
          provider: "trust_wallet",
          paymentReference,
          amount,
          currency: asset,
          asset,
          receivingWallet,
          status: "pending",
        });

      const subscription =
        await Subscription.findOneAndUpdate(
          {
            user: req.user.userId,
          },
          {
            $set: {
              status: "pending",
              payment: payment._id,
            },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

      res.status(201).json({
        message:
          "Crypto payment created",

        paymentId:
          payment._id,

        paymentReference:
          payment.paymentReference,

        amount:
          payment.amount,

        currency:
          payment.currency,

        asset:
          payment.asset,

        receivingWallet:
          payment.receivingWallet,

        status:
          payment.status,

        subscriptionStatus:
          subscription.status,

        network,
      });
    } catch (error) {
      console.error(
        "Create crypto payment error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create crypto payment",
      });
    }
  }
);

/*
 * Steps 125, 132, 133, 135:
 * Associate transaction hash and verify
 * the actual TRC-20 USDT payment.
 */
router.post(
  "/submit-transaction",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        paymentReference,
        transactionHash,
      } = req.body;

      if (
        !paymentReference ||
        !transactionHash
      ) {
        return res.status(400).json({
          message:
            "Payment reference and transaction hash are required",
        });
      }

      const normalizedHash =
        transactionHash
          .trim()
          .toLowerCase();

      if (
        !/^[a-f0-9]{64}$/.test(
          normalizedHash
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid TRON transaction hash.",
        });
      }

      const payment =
        await Payment.findOne({
          paymentReference,
          user: req.user.userId,
        });

      if (!payment) {
        return res.status(404).json({
          message:
            "Payment not found",
        });
      }

      const existingPayment =
        await Payment.findOne({
          transactionHash:
            normalizedHash,
        });

      if (
        existingPayment &&
        existingPayment._id.toString() !==
          payment._id.toString()
      ) {
        return res.status(409).json({
          message:
            "This transaction has already been used for another payment.",
        });
      }

      if (
        payment.transactionHash &&
        payment.transactionHash !==
          normalizedHash
      ) {
        return res.status(409).json({
          message:
            "A different transaction has already been submitted for this payment.",
        });
      }

      const blockchainData =
        await getTransactionData(
          normalizedHash
        );

      if (!blockchainData) {
        return res.status(400).json({
          message:
            "Transaction was not found on the TRON network.",
        });
      }

      const {
        transaction,
        transactionInfo,
      } = blockchainData;

      if (
        !transactionInfo ||
        transactionInfo.blockNumber ===
          undefined
      ) {
        return res.status(202).json({
          message:
            "Transaction is still pending confirmation.",

          status:
            "pending",
        });
      }

      if (
        transactionInfo.receipt?.result &&
        transactionInfo.receipt.result !==
          "SUCCESS"
      ) {
        payment.transactionHash =
          normalizedHash;

        payment.status =
          "failed";

        payment.failureReason =
          `Blockchain execution failed: ${transactionInfo.receipt.result}`;

        await payment.save();

        await Subscription.findOneAndUpdate(
          {
            user: req.user.userId,
          },
          {
            $set: {
              status: "inactive",
            },
          }
        );

        return res.status(400).json({
          message:
            "The blockchain transaction failed.",

          status:
            "failed",
        });
      }

      const transferDetails =
        extractTransferDetails({
          transaction,
          transactionInfo,
        });

      if (!transferDetails) {
        payment.transactionHash =
          normalizedHash;

        payment.status =
          "failed";

        payment.failureReason =
          "Transaction is not a valid TRC-20 USDT transfer.";

        await payment.save();

        return res.status(400).json({
          message:
            "Transaction is not a valid TRC-20 USDT transfer.",

          status:
            "failed",
        });
      }

      const configuredWalletHex =
        decodeBase58Address(
          payment.receivingWallet
        );

      if (
        transferDetails.recipient !==
        configuredWalletHex
      ) {
        payment.transactionHash =
          normalizedHash;

        payment.status =
          "failed";

        payment.failureReason =
          "Transaction was not sent to the configured receiving wallet.";

        await payment.save();

        return res.status(400).json({
          message:
            "Transaction was not sent to the configured receiving wallet.",

          status:
            "failed",
        });
      }

      const requiredAmount =
        Number(payment.amount);

      const receivedAmount =
        transferDetails.amountUSDT;

      /*
       * Step 132:
       * Handle underpayment.
       */
      if (
        receivedAmount <
        requiredAmount
      ) {
        payment.transactionHash =
          normalizedHash;

        payment.status =
          "failed";

        payment.failureReason =
          `Underpayment: received ${receivedAmount} ${payment.asset}; required ${requiredAmount} ${payment.asset}.`;

        await payment.save();

        await Subscription.findOneAndUpdate(
          {
            user: req.user.userId,
          },
          {
            $set: {
              status: "inactive",
              payment: payment._id,
              startedAt: null,
              expiresAt: null,
            },
          }
        );

        return res.status(400).json({
          message:
            `Underpayment detected. Received ${receivedAmount} ${payment.asset}; required ${requiredAmount} ${payment.asset}.`,

          status:
            "underpaid",

          receivedAmount,

          requiredAmount,
        });
      }

      /*
       * Step 133:
       * Accept overpayment.
       */
      const isOverpayment =
        receivedAmount >
        requiredAmount;

      payment.transactionHash =
        normalizedHash;

      payment.status =
        "paid";

      payment.paidAt =
        new Date();

      payment.failureReason =
        null;

      await payment.save();

      /*
       * Step 135:
       * Send payment confirmation email.
       */
      try {
        const user =
          await User.findById(
            req.user.userId
          ).select(
            "name email"
          );

        if (
          user &&
          user.email
        ) {
          await transporter.sendMail({
            from:
              process.env.EMAIL_USER,

            to:
              user.email,

            subject:
              "SecurePDF Vault - Payment Confirmation",

            text:
              `Hello ${user.name},\n\n` +
              `Your crypto payment has been successfully verified.\n\n` +
              `Payment Reference: ${payment.paymentReference}\n` +
              `Amount Received: ${receivedAmount} ${payment.asset}\n` +
              `Required Amount: ${requiredAmount} ${payment.asset}\n` +
              `Transaction Hash: ${payment.transactionHash}\n` +
              `Network: ${process.env.PAYMENT_NETWORK}\n\n` +
              (
                isOverpayment
                  ? `Overpayment Accepted: ${receivedAmount - requiredAmount} ${payment.asset}\n\n`
                  : ""
              ) +
              `Your payment has been recorded successfully. Your subscription can now be activated.\n\n` +
              `Thank you for using SecurePDF Vault.`,
          });
        }
      } catch (emailError) {
        console.error(
          "Payment confirmation email error:",
          emailError
        );
      }

      return res.status(200).json({
        message:
          isOverpayment
            ? "Payment verified successfully. Overpayment accepted."
            : "Payment verified successfully.",

        paymentReference:
          payment.paymentReference,

        transactionHash:
          payment.transactionHash,

        receivedAmount,

        requiredAmount,

        overpaymentAmount:
          isOverpayment
            ? receivedAmount -
              requiredAmount
            : 0,

        status:
          "paid",
      });
    } catch (error) {
      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "This transaction has already been used.",
        });
      }

      console.error(
        "Submit transaction error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to verify transaction.",
      });
    }
  }
);

/*
 * Step 131:
 * Activate a subscription only after the payment
 * has already been successfully verified and marked paid.
 *
 * Subscription duration: 30 days.
 */
router.post(
  "/activate-subscription",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        paymentReference,
      } = req.body;

      if (!paymentReference) {
        return res.status(400).json({
          message:
            "Payment reference is required",
        });
      }

      const payment =
        await Payment.findOne({
          paymentReference,
          user: req.user.userId,
        });

      if (!payment) {
        return res.status(404).json({
          message:
            "Payment not found",
        });
      }

      if (
        payment.status !==
        "paid"
      ) {
        return res.status(400).json({
          message:
            "Subscription cannot be activated until the payment is successfully verified.",
        });
      }

      if (!payment.paidAt) {
        payment.paidAt =
          new Date();

        await payment.save();
      }

      const startedAt =
        payment.paidAt;

      const expiresAt =
        new Date(startedAt);

      expiresAt.setDate(
        expiresAt.getDate() + 30
      );

      const subscription =
        await Subscription.findOneAndUpdate(
          {
            user: req.user.userId,
          },
          {
            $set: {
              status:
                "active",

              payment:
                payment._id,

              startedAt,

              expiresAt,
            },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert:
              true,
          }
        );

      return res.status(200).json({
        message:
          "Subscription activated successfully.",

        subscription: {
          status:
            subscription.status,

          startedAt:
            subscription.startedAt,

          expiresAt:
            subscription.expiresAt,
        },
      });
    } catch (error) {
      console.error(
        "Activate subscription error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to activate subscription.",
      });
    }
  }
);

module.exports = router;