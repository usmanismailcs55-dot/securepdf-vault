import { useState } from "react";

export default function Subscription() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);

    // Payment checkout will be added in Step 112
    setTimeout(() => {
      setLoading(false);
      alert("Payment checkout will be added in Step 112.");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          SecurePDF Vault
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Protect and securely share your PDF files.
        </p>

        <div className="border rounded-xl p-6 mt-8">
          <h2 className="text-2xl font-semibold">
            Premium Plan
          </h2>

          <p className="text-4xl font-bold mt-4">
            $5
            <span className="text-base font-normal text-gray-500">
              {" "}
              / month
            </span>
          </p>

          <ul className="mt-6 space-y-3 text-gray-700">
            <li>✓ PDF password protection</li>
            <li>✓ Secure PDF links</li>
            <li>✓ Link expiration</li>
            <li>✓ Download tracking</li>
            <li>✓ Secure document storage</li>
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full mt-8 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Subscribe Now"}
          </button>
        </div>
      </div>
    </div>
  );
}