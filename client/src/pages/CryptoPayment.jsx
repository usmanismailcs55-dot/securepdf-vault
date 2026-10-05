import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  WalletCards,
  ArrowRight,
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

  const [paymentStatus, setPaymentStatus] =
    useState("");

  const [paymentStatusType, setPaymentStatusType] =
    useState("");

  const [paymentHistory, setPaymentHistory] =
    useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [historyError, setHistoryError] =
    useState("");

  useEffect(() => {
    const accessToken =
      localStorage.getItem("accessToken");

    if (!accessToken) {
      return;
    }

    const loadPaymentHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await fetch(
          "https://localhost:5000/api/payments/history",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load payment history."
          );
        }

        setPaymentHistory(
          Array.isArray(data.payments)
            ? data.payments
            : []
        );
      } catch (error) {
        console.error(
          "Load payment history error:",
          error
        );

        setHistoryError(
          error.message ||
            "Unable to load payment history."
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    loadPaymentHistory();
  }, []);

  useEffect(() => {
    const createPayment = async () => {
      try {
        setPaymentLoading(true);
        setPaymentError("");
        setPaymentStatus("");
        setPaymentStatusType("");

        const accessToken =
          localStorage.getItem("accessToken");

        if (!accessToken) {
          setPaymentError(
            "You must be logged in to create a payment."
          );
          return;
        }

        const response = await fetch(
          "https://localhost:5000/api/payments/create",
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

        setPaymentStatus(
          "Payment created. Waiting for your transaction."
        );
        setPaymentStatusType("pending");
      } catch (error) {
        console.error(
          "Create payment error:",
          error
        );

        setPaymentError(
          error.message ||
            "Unable to create payment."
        );

        setPaymentStatus(
          "Unable to create the payment."
        );
        setPaymentStatusType("failed");
      } finally {
        setPaymentLoading(false);
      }
    };

    createPayment();
  }, [paymentAmount]);

  const handleCopy = async () => {
    if (!walletAddress) {
      return;
    }

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

    setPaymentStatus("");
    setPaymentStatusType("");
  };

  const handleSubmitTransaction = async (event) => {
    event.preventDefault();

    const hash = transactionHash.trim();

    setHashError("");
    setSubmitted(false);
    setQueryStatus("");
    setTransactionData(null);

    setPaymentStatus("");
    setPaymentStatusType("");

    if (!paymentReference) {
      setQueryStatus(
        "Payment reference is not available yet."
      );

      setPaymentStatus(
        "Payment is still being prepared."
      );
      setPaymentStatusType("pending");

      return;
    }

    const tronTransactionHashRegex =
      /^[a-fA-F0-9]{64}$/;

    if (!hash) {
      setHashError(
        "Please enter your transaction hash."
      );

      setPaymentStatus(
        "Please enter your transaction hash."
      );
      setPaymentStatusType("failed");

      return;
    }

    if (!tronTransactionHashRegex.test(hash)) {
      setHashError(
        "Invalid TRON transaction hash. The transaction hash must contain exactly 64 hexadecimal characters."
      );

      setPaymentStatus(
        "Payment could not be verified because the transaction hash is invalid."
      );
      setPaymentStatusType("failed");

      return;
    }

    setSubmitted(true);
    setQueryStatus(
      "Querying the TRON blockchain..."
    );

    setPaymentStatus(
      "Your payment is being verified..."
    );
    setPaymentStatusType("pending");

    try {
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

        setPaymentStatus(
          "Payment verification failed."
        );
        setPaymentStatusType("failed");

        return;
      }

      if (!data || !data.txID) {
        setQueryStatus(
          "Transaction was not found on the TRON network."
        );

        setPaymentStatus(
          "Transaction not found. Your payment is not verified yet."
        );
        setPaymentStatusType("failed");

        return;
      }

      setQueryStatus(
        "Transaction found. Checking confirmation status..."
      );

      setPaymentStatus(
        "Transaction found. Waiting for blockchain confirmation..."
      );
      setPaymentStatusType("pending");

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

      if (
        !transactionInfo ||
        Object.keys(transactionInfo).length === 0
      ) {
        setQueryStatus(
          "Transaction is pending confirmation on the TRON network. Please wait and try again."
        );

        setPaymentStatus(
          "Payment is pending confirmation."
        );
        setPaymentStatusType("pending");

        setTransactionData({
          ...data,
          transactionInfo,
          paymentReference,
          status: "pending",
        });

        return;
      }

      if (
        transactionInfo.blockNumber === undefined ||
        transactionInfo.blockNumber === null
      ) {
        setQueryStatus(
          "Transaction is pending confirmation on the TRON network. Please wait and try again."
        );

        setPaymentStatus(
          "Payment is pending confirmation."
        );
        setPaymentStatusType("pending");

        setTransactionData({
          ...data,
          transactionInfo,
          paymentReference,
          status: "pending",
        });

        return;
      }

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

          setPaymentStatus(
            "Payment failed because the blockchain transaction failed."
          );
          setPaymentStatusType("failed");

          setTransactionData({
            ...data,
            transactionInfo,
            paymentReference,
            status: "failed",
          });

          return;
        }
      }

      const transferAmount =
        data?.raw_data?.contract?.[0]?.parameter?.value
          ?.amount;

      if (!transferAmount) {
        setQueryStatus(
          "Transaction was found, but the transfer amount could not be determined."
        );

        setPaymentStatus(
          "Payment amount could not be verified."
        );
        setPaymentStatusType("failed");

        return;
      }

      const expectedAmount =
        Number(paymentAmount) * 1_000_000;

      if (Number(transferAmount) !== expectedAmount) {
        setQueryStatus(
          `Transaction amount does not match the required ${paymentAmount} ${paymentAsset}.`
        );

        setPaymentStatus(
          `Payment amount does not match the required ${paymentAmount} ${paymentAsset}.`
        );
        setPaymentStatusType("failed");

        return;
      }

      const contractType =
        data?.raw_data?.contract?.[0]?.type;

      if (contractType !== "TriggerSmartContract") {
        setQueryStatus(
          "Transaction is not a TRC-20 token transfer."
        );

        setPaymentStatus(
          "Payment failed because the transaction is not a valid TRC-20 token transfer."
        );
        setPaymentStatusType("failed");

        return;
      }

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

        setPaymentStatus(
          "Payment failed because it was sent to the wrong wallet."
        );
        setPaymentStatusType("failed");

        return;
      }

      const paymentResponse = await fetch(
        "https://localhost:5000/api/payments/submit-transaction",
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
        const resultStatus =
          paymentResult.status;

        if (resultStatus === "underpaid") {
          setPaymentStatus(
            `Underpayment: you paid ${paymentResult.receivedAmount} ${paymentAsset}, but ${paymentResult.requiredAmount} ${paymentAsset} is required.`
          );
        } else {
          setPaymentStatus(
            paymentResult.message ||
              "This payment could not be verified."
          );
        }

        setPaymentStatusType("failed");

        setQueryStatus(
          paymentResult.message ||
            "This transaction could not be associated with the payment."
        );

        setTransactionData({
          ...data,
          transactionInfo,
          paymentReference,
          status:
            resultStatus === "underpaid"
              ? "underpaid"
              : "failed",
        });

        return;
      }

      const receivedAmount =
        Number(paymentResult.receivedAmount);

      const requiredAmount =
        Number(paymentResult.requiredAmount);

      const overpaymentAmount =
        Number(paymentResult.overpaymentAmount || 0);

      if (
        receivedAmount >
        requiredAmount
      ) {
        setPaymentStatus(
          `Payment successful. You paid ${receivedAmount} ${paymentAsset}, which is ${overpaymentAmount} ${paymentAsset} over the required amount. Your overpayment was accepted.`
        );
        setPaymentStatusType("success");
      } else {
        setPaymentStatus(
          `Payment successful. ${requiredAmount} ${paymentAsset} received.`
        );
        setPaymentStatusType("success");
      }

      setTransactionData({
        ...data,
        transactionInfo,
        paymentReference,
        status: "paid",
      });

      setQueryStatus(
        `Transaction verified and associated with payment reference ${paymentReference}.`
      );

      try {
        const accessToken =
          localStorage.getItem("accessToken");

        const historyResponse = await fetch(
          "https://localhost:5000/api/payments/history",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const historyData =
          await historyResponse.json();

        if (historyResponse.ok) {
          setPaymentHistory(
            Array.isArray(historyData.payments)
              ? historyData.payments
              : []
          );
        }
      } catch (historyRefreshError) {
        console.error(
          "Refresh payment history error:",
          historyRefreshError
        );
      }
    } catch (error) {
      console.error(
        "Failed to query TRON transaction:",
        error
      );

      setQueryStatus(
        "Unable to query the TRON blockchain. Please try again."
      );

      setPaymentStatus(
        "Payment verification could not be completed. Please try again."
      );
      setPaymentStatusType("failed");
    }
  };

  const getPaymentStatusClasses = () => {
    return "border-black bg-white text-black";
  };

  const getPaymentStatusIcon = () => {
    if (paymentStatusType === "success") {
      return (
        <CheckCircle
          size={20}
          className="shrink-0 text-black"
        />
      );
    }

    return (
      <AlertTriangle
        size={20}
        className="shrink-0 text-black"
      />
    );
  };

  const formatPaymentDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="w-full bg-white">
        <div className="w-full overflow-hidden">
          <img
            src="/images/noir-vault-hero.jpg"
            alt="Noir eyes"
            className="block h-[55vh] min-h-[420px] w-full object-cover object-center grayscale sm:h-[65vh] lg:h-[72vh]"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl bg-white px-4 py-10 text-black sm:px-6 lg:px-8">
        {paymentError && (
          <div className="mb-6 flex items-start gap-3 border border-black bg-white p-4 text-black">
            <AlertTriangle
              className="mt-0.5 shrink-0 text-black"
              size={20}
            />

            <p className="text-sm leading-6 text-black">
              {paymentError}
            </p>
          </div>
        )}

        {paymentStatus && (
          <div
            className={`mb-6 flex items-start gap-3 border p-4 ${getPaymentStatusClasses()}`}
          >
            {getPaymentStatusIcon()}

            <div>
              <p className="text-sm font-semibold tracking-wide text-black">
                Payment status
              </p>

              <p className="mt-1 text-sm leading-6 text-black">
                {paymentStatus}
              </p>
            </div>
          </div>
        )}

        <section className="border-y border-black bg-white py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-black">
                Payment
              </p>

              <p className="mt-2 text-3xl text-black">
                {paymentAmount} {paymentAsset}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-black">
                Network
              </p>

              <p className="mt-2 text-sm text-black">
                {paymentNetwork}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-black pt-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[10px] uppercase tracking-[0.18em] text-black">
                Reference
              </span>

              <span className="break-all font-mono text-xs text-black sm:max-w-lg sm:text-right">
                {paymentLoading
                  ? "Creating..."
                  : paymentReference ||
                    "Unavailable"}
              </span>
            </div>
          </div>
        </section>

        <section className="border-b border-black py-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              {walletAddress ? (
                <div className="border border-black bg-white p-4">
                  <QRCodeSVG
                    value={walletAddress}
                    size={230}
                    level="H"
                    includeMargin
                  />
                </div>
              ) : (
                <div className="flex min-h-[230px] w-[230px] items-center justify-center border border-black bg-white p-6 text-center text-sm text-black">
                  Payment wallet is not configured.
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3">
                <WalletCards
                  size={19}
                  strokeWidth={1.5}
                  className="text-black"
                />

                <p className="text-sm text-black">
                  Send payment
                </p>
              </div>

              {walletAddress && (
                <>
                  <div className="break-all border border-black bg-white p-4 font-mono text-xs leading-6 text-black">
                    {walletAddress}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="mt-3 flex items-center justify-center gap-2 border border-black bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={17} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={17} />
                        Copy address
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-black py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-l border-black pl-4">
              <span className="font-serif text-lg text-black">
                01
              </span>

              <p className="mt-2 text-sm leading-6 text-black">
                Open Trust Wallet and select{" "}
                <strong className="font-medium text-black">
                  {paymentAsset}
                </strong>
                .
              </p>
            </div>

            <div className="border-l border-black pl-4">
              <span className="font-serif text-lg text-black">
                02
              </span>

              <p className="mt-2 text-sm leading-6 text-black">
                Use the{" "}
                <strong className="font-medium text-black">
                  {paymentNetwork}
                </strong>{" "}
                network.
              </p>
            </div>

            <div className="border-l border-black pl-4">
              <span className="font-serif text-lg text-black">
                03
              </span>

              <p className="mt-2 text-sm leading-6 text-black">
                Send{" "}
                <strong className="font-medium text-black">
                  {paymentAmount} {paymentAsset}
                </strong>
                .
              </p>
            </div>

            <div className="border-l border-black pl-4">
              <span className="font-serif text-lg text-black">
                04
              </span>

              <p className="mt-2 text-sm leading-6 text-black">
                Confirm the receiving wallet before sending.
              </p>
            </div>

            <div className="border-l border-black pl-4">
              <span className="font-serif text-lg text-black">
                05
              </span>

              <p className="mt-2 text-sm leading-6 text-black">
                Copy your transaction hash after payment.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-black py-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 shrink-0 text-black"
              size={19}
            />

            <p className="text-sm leading-6 text-black">
              Send only{" "}
              <strong className="text-black">
                {paymentAmount} {paymentAsset}
              </strong>{" "}
              using{" "}
              <strong className="text-black">
                {paymentNetwork}
              </strong>
              . Using another asset or network may prevent
              the payment from being credited.
            </p>
          </div>
        </section>

        <section className="border-b border-black py-8">
          <div className="mb-5 flex items-center gap-3">
            <ShieldCheck
              size={19}
              strokeWidth={1.5}
              className="text-black"
            />

            <p className="text-sm text-black">
              Verify transaction
            </p>
          </div>

          <form onSubmit={handleSubmitTransaction}>
            <label
              htmlFor="transactionHash"
              className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-black"
            >
              Transaction hash
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
              className={`w-full border bg-white px-4 py-3 font-mono text-xs text-black outline-none transition placeholder:text-black ${
                hashError
                  ? "border-black focus:border-black"
                  : "border-black focus:border-black"
              }`}
            />

            {hashError && (
              <div className="mt-3 flex items-start gap-2 text-sm text-black">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-black"
                />

                <p>{hashError}</p>
              </div>
            )}

            {submitted && !hashError && (
              <div className="mt-3 flex items-start gap-2 text-sm text-black">
                <CheckCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-black"
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
              className="mt-4 flex w-full items-center justify-center gap-2 border border-black bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
            >
              Submit transaction
              <ArrowRight size={17} />
            </button>
          </form>

          {queryStatus && (
            <div className="mt-5 border border-black bg-white p-4">
              <p className="text-sm leading-6 text-black">
                {queryStatus}
              </p>
            </div>
          )}

          {transactionData && (
            <div className="mt-5 border border-black bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                {transactionData.status === "paid" ? (
                  <CheckCircle
                    size={19}
                    className="text-black"
                  />
                ) : (
                  <AlertTriangle
                    size={19}
                    className="text-black"
                  />
                )}

                <h3 className="text-sm font-semibold tracking-wide text-black">
                  {transactionData.status === "pending"
                    ? "Transaction Pending"
                    : transactionData.status === "failed"
                    ? "Transaction Failed"
                    : transactionData.status === "underpaid"
                    ? "Payment Underpaid"
                    : "Payment Successful"}
                </h3>
              </div>

              <div className="space-y-3 border-t border-black pt-4">
                <p className="break-all text-xs leading-6 text-black">
                  <span className="text-black">
                    Transaction ID:
                  </span>{" "}
                  <span className="font-mono text-black">
                    {transactionData.txID}
                  </span>
                </p>

                <p className="break-all text-xs leading-6 text-black">
                  <span className="text-black">
                    Payment Reference:
                  </span>{" "}
                  <span className="font-mono text-black">
                    {transactionData.paymentReference}
                  </span>
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="py-8">
          <div className="mb-5 flex items-center gap-3">
            <WalletCards
              size={19}
              strokeWidth={1.5}
              className="text-black"
            />

            <p className="text-sm text-black">
              Payment history
            </p>
          </div>

          {historyLoading ? (
            <div className="border border-black bg-white p-5">
              <p className="text-sm text-black">
                Loading payment history...
              </p>
            </div>
          ) : historyError ? (
            <div className="flex items-start gap-3 border border-black bg-white p-4">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-black"
                size={19}
              />

              <p className="text-sm leading-6 text-black">
                {historyError}
              </p>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="border border-black bg-white p-5">
              <p className="text-sm text-black">
                No payment history found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div
                  key={payment._id}
                  className="border border-black bg-white p-5"
                >
                  <div className="mb-5 flex flex-col gap-3 border-b border-black pb-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="break-all font-mono text-xs text-black">
                        {payment.paymentReference}
                      </p>

                      <p className="mt-2 text-[11px] text-black">
                        {formatPaymentDate(
                          payment.createdAt
                        )}
                      </p>
                    </div>

                    <span className="inline-flex w-fit border border-black bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
                      {payment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-black">
                        Amount
                      </span>

                      <p className="mt-1 text-black">
                        {payment.amount}{" "}
                        {payment.asset}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-black">
                        Paid at
                      </span>

                      <p className="mt-1 text-black">
                        {formatPaymentDate(
                          payment.paidAt
                        )}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-black">
                        Transaction hash
                      </span>

                      <p className="mt-1 break-all font-mono text-xs leading-6 text-black">
                        {payment.transactionHash ||
                          "Not submitted"}
                      </p>
                    </div>

                    {payment.failureReason && (
                      <div className="md:col-span-2">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-black">
                          Failure reason
                        </span>

                        <p className="mt-1 text-sm leading-6 text-black">
                          {payment.failureReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex items-center justify-center gap-2 border-t border-black pt-6 text-center text-[10px] uppercase tracking-[0.2em] text-black">
          <ShieldCheck
            size={14}
            className="text-black"
          />
          Secure cryptocurrency payment
        </div>
      </section>
    </main>
  );
}
