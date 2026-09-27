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
      setHistoryError(
        "You must be logged in to view payment history."
      );
      setHistoryLoading(false);
      return;
    }

    const loadPaymentHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await fetch(
          "http://localhost:5000/api/payments/history",
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
        data?.raw_data?.contract?.[0]?.parameter?.value?.amount;

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

      /*
       * Refresh payment history after successful verification.
       */
      try {
        const accessToken =
          localStorage.getItem("accessToken");

        const historyResponse = await fetch(
          "http://localhost:5000/api/payments/history",
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
    if (paymentStatusType === "success") {
      return "bg-green-50 border-green-200 text-green-800";
    }

    if (paymentStatusType === "failed") {
      return "bg-red-50 border-red-200 text-red-800";
    }

    return "bg-yellow-50 border-yellow-200 text-yellow-800";
  };

  const getPaymentStatusIcon = () => {
    if (paymentStatusType === "success") {
      return (
        <CheckCircle
          size={22}
          className="text-green-600 flex-shrink-0"
        />
      );
    }

    return (
      <AlertTriangle
        size={22}
        className={
          paymentStatusType === "failed"
            ? "text-red-600 flex-shrink-0"
            : "text-yellow-600 flex-shrink-0"
        }
      />
    );
  };

  const formatPaymentDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  const getHistoryStatusClasses = (status) => {
    if (status === "paid") {
      return "bg-green-100 text-green-800";
    }

    if (
      status === "failed" ||
      status === "expired" ||
      status === "refunded"
    ) {
      return "bg-red-100 text-red-800";
    }

    return "bg-yellow-100 text-yellow-800";
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

          {/* Step 134: Payment Status Notification */}
          {paymentStatus && (
            <div
              className={`flex items-start gap-3 p-4 mb-6 border rounded-lg ${getPaymentStatusClasses()}`}
            >
              {getPaymentStatusIcon()}

              <div>
                <p className="font-semibold">
                  Payment Status
                </p>

                <p className="text-sm mt-1">
                  {paymentStatus}
                </p>
              </div>
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
                    : transactionData.status === "failed" ||
                      transactionData.status === "underpaid"
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
                  ) : transactionData.status === "failed" ||
                    transactionData.status === "underpaid" ? (
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
                      : transactionData.status === "underpaid"
                      ? "Payment Underpaid"
                      : "Payment Successful"}
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

          {/* Step 136: Payment History */}
          <div className="border rounded-xl p-6 mt-6">

            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              Payment History
            </h2>

            {historyLoading ? (
              <p className="text-sm text-gray-600">
                Loading payment history...
              </p>
            ) : historyError ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle
                  className="text-red-600 flex-shrink-0"
                  size={20}
                />

                <p className="text-sm text-red-700">
                  {historyError}
                </p>
              </div>
            ) : paymentHistory.length === 0 ? (
              <p className="text-sm text-gray-600">
                No payment history found.
              </p>
            ) : (
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment._id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">

                      <div>
                        <p className="font-semibold text-gray-900">
                          {payment.paymentReference}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {formatPaymentDate(
                            payment.createdAt
                          )}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold uppercase ${getHistoryStatusClasses(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

                      <div>
                        <span className="text-gray-500">
                          Amount
                        </span>

                        <p className="font-medium text-gray-900">
                          {payment.amount}{" "}
                          {payment.asset}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-500">
                          Paid At
                        </span>

                        <p className="font-medium text-gray-900">
                          {formatPaymentDate(
                            payment.paidAt
                          )}
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-gray-500">
                          Transaction Hash
                        </span>

                        <p className="font-mono text-xs text-gray-900 break-all mt-1">
                          {payment.transactionHash ||
                            "Not submitted"}
                        </p>
                      </div>

                      {payment.failureReason && (
                        <div className="md:col-span-2">
                          <span className="text-gray-500">
                            Failure Reason
                          </span>

                          <p className="text-sm text-red-700 mt-1">
                            {payment.failureReason}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}