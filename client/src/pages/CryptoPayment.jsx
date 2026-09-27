import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function CryptoPayment() {
  const walletAddress =
    import.meta.env.VITE_PAYMENT_RECEIVING_WALLET || "";

  const paymentAmount =
    import.meta.env.VITE_PAYMENT_AMOUNT || "500";

  const paymentAsset =
    import.meta.env.VITE_PAYMENT_ASSET || "USDT";

  const paymentNetwork =
    import.meta.env.VITE_PAYMENT_NETWORK || "TRON (TRC-20)";

  const tronApiUrl =
    import.meta.env.VITE_TRON_API_URL ||
    "https://api.trongrid.io";

  const [copied, setCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [hashError, setHashError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [queryStatus, setQueryStatus] = useState("");
  const [transactionData, setTransactionData] = useState(null);

  const [paymentReference, setPaymentReference] =
    useState("");

  const [paymentLoading, setPaymentLoading] =
    useState(true);

  const [paymentError, setPaymentError] =
    useState("");

  useEffect(() => {
    const createPayment = async () => {
      try {
        setPaymentLoading(true);
        setPaymentError("");

        const accessToken =
          localStorage.getItem("accessToken");

        if (!accessToken) {
          setPaymentError(
            "You must be logged in to create a payment."
          );
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/payments/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              amount: Number(paymentAmount),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to create payment."
          );
        }

        setPaymentReference(
          data.paymentReference
        );
      } catch (error) {
        console.error(
          "Create payment error:",
          error
        );

        setPaymentError(
          error.message ||
            "Unable to create payment."
        );
      } finally {
        setPaymentLoading(false);
      }
    };

    createPayment();
  }, [paymentAmount]);

  const handleCopy = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy wallet address:",
        error
      );
    }
  };

  const handleTransactionHashChange = (event) => {
    const value = event.target.value;

    setTransactionHash(value);
    setHashError("");
    setSubmitted(false);
    setQueryStatus("");
    setTransactionData(null);
  };

  const handleSubmitTransaction = async (event) => {
    event.preventDefault();

    const hash = transactionHash.trim();

    setHashError("");
    setSubmitted(false);
    setQueryStatus("");
    setTransactionData(null);

    if (!paymentReference) {
      setQueryStatus(
        "Payment reference is not available yet."
      );
      return;
    }

    // Step 118: Validate hash format
    const tronTransactionHashRegex =
      /^[a-fA-F0-9]{64}$/;

    if (!hash) {
      setHashError(
        "Please enter your transaction hash."
      );
      return;
    }

    if (!tronTransactionHashRegex.test(hash)) {
      setHashError(
        "Invalid TRON transaction hash. The transaction hash must contain exactly 64 hexadecimal characters."
      );
      return;
    }

    setSubmitted(true);
    setQueryStatus(
      "Querying the TRON blockchain..."
    );

    try {
      // Step 119: Query TRON blockchain
      const response = await fetch(
        `${tronApiUrl}/wallet/gettransactionbyid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: hash,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `TRON API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "TRON transaction response:",
        data
      );

      if (data.Error) {
        setQueryStatus(
          `TRON API error: ${data.Error}`
        );
        return;
      }

      if (!data || !data.txID) {
        setQueryStatus(
          "Transaction was not found on the TRON network."
        );
        return;
      }

      /*
       * Step 126:
       * A transaction can exist on TRON before its
       * execution information is available.
       *
       * Query transaction info separately to determine
       * whether the transaction has been confirmed.
       */
      setQueryStatus(
        "Transaction found. Checking confirmation status..."
      );

      const infoResponse = await fetch(
        `${tronApiUrl}/wallet/gettransactioninfobyid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: hash,
          }),
        }
      );

      if (!infoResponse.ok) {
        throw new Error(
          `TRON transaction information request failed with status ${infoResponse.status}`
        );
      }

      const transactionInfo =
        await infoResponse.json();

      console.log(
        "TRON transaction info:",
        transactionInfo
      );

      /*
       * If transaction information is not available yet,
       * keep the payment in a pending state.
       */
      if (
        !transactionInfo ||
        Object.keys(transactionInfo).length === 0
      ) {
        setQueryStatus(
          "Transaction is pending confirmation on the TRON network. Please wait and try again."
        );

        setTransactionData({
          ...data,
          transactionInfo,
          paymentReference,
          status: "pending",
        });

        return;
      }

      /*
       * A block number indicates that the transaction
       * has been included in a TRON block.
       */
      if (
        transactionInfo.blockNumber === undefined ||
        transactionInfo.blockNumber === null
      ) {
        setQueryStatus(
          "Transaction is pending confirmation on the TRON network. Please wait and try again."
        );

        setTransactionData({
          ...data,
          transactionInfo,
          paymentReference,
          status: "pending",
        });

        return;
      }

      // Step 120: Verify blockchain transaction execution
      if (
        transactionInfo.receipt &&
        transactionInfo.receipt.result
      ) {
        const executionResult =
          transactionInfo.receipt.result;

        if (executionResult !== "SUCCESS") {
          setQueryStatus(
            `Transaction found, but blockchain execution status is: ${executionResult}`
          );

          setTransactionData({
            ...data,
            transactionInfo,
            paymentReference,
            status: "failed",
          });

          return;
        }
      }

      /*
       * Step 121: Verify transaction amount
       *
       * NOTE:
       * The existing TRC-20 amount verification remains
       * unchanged here and will be corrected in the
       * dedicated token-verification step.
       */
      const transferAmount =
        data?.raw_data?.contract?.[0]?.parameter?.value?.amount;

      if (!transferAmount) {
        setQueryStatus(
          "Transaction was found, but the transfer amount could not be determined."
        );
        return;
      }

      const expectedAmount =
        Number(paymentAmount) * 1_000_000;

      if (Number(transferAmount) !== expectedAmount) {
        setQueryStatus(
          `Transaction amount does not match the required ${paymentAmount} ${paymentAsset}.`
        );
        return;
      }

      // Step 122: Verify crypto/token asset
      const contractType =
        data?.raw_data?.contract?.[0]?.type;

      if (contractType !== "TriggerSmartContract") {
        setQueryStatus(
          "Transaction is not a TRC-20 token transfer."
        );
        return;
      }

      // Step 123: Verify receiving wallet
      const contractParameter =
        data?.raw_data?.contract?.[0]?.parameter?.value;

      const recipientAddress =
        contractParameter?.to_address;

      if (
        recipientAddress &&
        recipientAddress !== walletAddress
      ) {
        setQueryStatus(
          "Transaction was not sent to the configured receiving wallet."
        );
        return;
      }

      // Step 124/125: Associate transaction with payment
      const paymentResponse = await fetch(
        "http://localhost:5000/api/payments/submit-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "accessToken"
            )}`,
          },
          body: JSON.stringify({
            paymentReference,
            transactionHash: hash,
          }),
        }
      );

      const paymentResult =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        setQueryStatus(
          paymentResult.message ||
            "This transaction could not be associated with the payment."
        );
        return;
      }

      setTransactionData({
        ...data,
        transactionInfo,
        paymentReference,
        status: "verified",
      });

      setQueryStatus(
        `Transaction verified and associated with payment reference ${paymentReference}.`
      );
    } catch (error) {
      console.error(
        "Failed to query TRON transaction:",
        error
      );

      setQueryStatus(
        "Unable to query the TRON blockchain. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Complete Payment
            </h1>

            <p className="text-gray-600 mt-2">
              Pay securely using cryptocurrency to activate
              your subscription.
            </p>
          </div>

          {/* Payment Error */}
          {paymentError && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle
                className="text-red-600 flex-shrink-0"
                size={22}
              />

              <p className="text-red-700">
                {paymentError}
              </p>
            </div>
          )}

          {/* Payment Details */}
          <div className="border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              Payment Details
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">
                  Amount
                </span>

                <span className="font-semibold text-gray-900">
                  {paymentAmount} {paymentAsset}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">
                  Network
                </span>

                <span className="font-semibold text-gray-900">
                  {paymentNetwork}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Payment Reference
                </span>

                <span className="font-semibold text-gray-900 font-mono text-sm">
                  {paymentLoading
                    ? "Creating..."
                    : paymentReference ||
                      "Unavailable"}
                </span>
              </div>

            </div>
          </div>

          {/* Wallet + QR Code */}
          <div className="border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              Send Payment To
            </h2>

            {walletAddress ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="p-4 border rounded-xl bg-white">
                    <QRCodeSVG
                      value={walletAddress}
                      size={220}
                      level="H"
                      includeMargin
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  Receiving wallet address:
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-gray-100 rounded-lg break-all font-mono text-sm text-gray-800">
                    {walletAddress}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={18} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle
                  className="text-red-600"
                  size={22}
                />

                <p className="text-red-600">
                  Payment wallet is not configured.
                </p>
              </div>
            )}
          </div>

          {/* How to Pay */}
          <div className="border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              How to Pay
            </h2>

            <ol className="space-y-4 text-gray-700">

              <li className="flex gap-3">
                <span className="font-bold">1.</span>
                <span>
                  Open your{" "}
                  <strong>Trust Wallet</strong>.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-bold">2.</span>
                <span>
                  Select{" "}
                  <strong>{paymentAsset}</strong>.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-bold">3.</span>
                <span>
                  Make sure you are using the{" "}
                  <strong>{paymentNetwork}</strong>{" "}
                  network.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-bold">4.</span>
                <span>
                  Send exactly{" "}
                  <strong>
                    {paymentAmount} {paymentAsset}
                  </strong>
                  .
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-bold">5.</span>
                <span>
                  Send the payment to the receiving
                  wallet address shown above.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-bold">6.</span>
                <span>
                  After sending the payment, copy your{" "}
                  <strong>transaction hash</strong>.
                </span>
              </li>

            </ol>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-5 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
            <AlertTriangle
              className="text-yellow-600 flex-shrink-0"
              size={22}
            />

            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Important
              </h3>

              <p className="text-sm text-yellow-800">
                Send only{" "}
                <strong>
                  {paymentAmount} {paymentAsset}
                </strong>{" "}
                using the{" "}
                <strong>{paymentNetwork}</strong>{" "}
                network.
                Sending a different asset or using the
                wrong network may result in the payment
                not being credited.
              </p>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="border rounded-xl p-6">

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Transaction Hash
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              After sending your payment, paste the
              transaction hash below.
            </p>

            <form onSubmit={handleSubmitTransaction}>

              <label
                htmlFor="transactionHash"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Transaction Hash
              </label>

              <input
                id="transactionHash"
                type="text"
                value={transactionHash}
                onChange={handleTransactionHashChange}
                placeholder="Paste your TRON transaction hash"
                autoComplete="off"
                spellCheck="false"
                maxLength={64}
                className={`w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:border-blue-500 ${
                  hashError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />

              {hashError && (
                <div className="flex items-start gap-2 mt-3 text-sm text-red-600">
                  <AlertTriangle
                    size={18}
                    className="flex-shrink-0 mt-0.5"
                  />

                  <p>{hashError}</p>
                </div>
              )}

              {submitted && !hashError && (
                <div className="flex items-start gap-2 mt-3 text-sm text-green-600">
                  <CheckCircle
                    size={18}
                    className="flex-shrink-0"
                  />

                  <p>
                    Transaction hash format is valid.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  !transactionHash.trim() ||
                  !paymentReference ||
                  paymentLoading
                }
                className="w-full mt-4 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Transaction
              </button>

            </form>

            {/* Blockchain Query Status */}
            {queryStatus && (
              <div className="mt-5 p-4 bg-gray-50 border rounded-lg">
                <p className="text-sm text-gray-700">
                  {queryStatus}
                </p>
              </div>
            )}

            {/* Retrieved Transaction Data */}
            {transactionData && (
              <div
                className={`mt-5 p-4 rounded-lg ${
                  transactionData.status === "pending"
                    ? "bg-yellow-50 border border-yellow-200"
                    : transactionData.status === "failed"
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >

                <div className="flex items-center gap-2 mb-3">

                  {transactionData.status === "pending" ? (
                    <AlertTriangle
                      size={20}
                      className="text-yellow-600"
                    />
                  ) : transactionData.status === "failed" ? (
                    <AlertTriangle
                      size={20}
                      className="text-red-600"
                    />
                  ) : (
                    <CheckCircle
                      size={20}
                      className="text-green-600"
                    />
                  )}

                  <h3 className="font-semibold">
                    {transactionData.status === "pending"
                      ? "Transaction Pending"
                      : transactionData.status === "failed"
                      ? "Transaction Failed"
                      : "Transaction Verified"}
                  </h3>

                </div>

                <p className="text-sm text-gray-700 break-all mb-2">
                  <strong>Transaction ID:</strong>{" "}
                  {transactionData.txID}
                </p>

                <p className="text-sm text-gray-700 break-all">
                  <strong>Payment Reference:</strong>{" "}
                  {transactionData.paymentReference}
                </p>

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}