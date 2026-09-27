export default function CryptoPayment() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">
          Crypto Payment
        </h1>

        <p className="text-gray-600 mb-6">
          Choose your cryptocurrency payment method below.
        </p>

        <div className="border rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">
            Cryptocurrency Payment
          </h2>

          <p className="text-gray-600">
            Cryptocurrency payment options will be available here.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">
            Payment wallet details will be configured in the next step.
          </p>
        </div>
      </div>
    </div>
  );
}