import { QRCodeSVG } from "qrcode.react";

export default function CryptoPayment() {
  const walletAddress =
    import.meta.env.VITE_PAYMENT_RECEIVING_WALLET || "";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">
          Crypto Payment
        </h1>

        <p className="text-gray-600 mb-6">
          Pay securely using USDT on the TRON (TRC-20) network.
        </p>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            USDT — TRON (TRC-20)
          </h2>

          {walletAddress ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 border rounded-lg bg-white">
                  <QRCodeSVG
                    value={walletAddress}
                    size={220}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-2">
                Send USDT to this TRON wallet address:
              </p>

              <div className="p-3 bg-gray-100 rounded-lg break-all font-mono text-sm">
                {walletAddress}
              </div>
            </>
          ) : (
            <p className="text-red-600">
              Payment wallet is not configured.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
