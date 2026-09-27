import { Check } from "lucide-react";

const plans = [
  {
    name: "Pro",
    price: "$5",
    period: "month",
    features: [
      "PDF password protection",
      "Secure document links",
      "Document expiration",
      "Download tracking",
      "Access history",
    ],
  },
];

export default function Subscription() {
  const handleSubscribe = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        alert("Please login first.");
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
            plan: "monthly",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create payment");
      }

      console.log("Payment created:", data);

      alert(
        `Payment created successfully.\nPayment Reference: ${data.paymentReference}`
      );
    } catch (error) {
      console.error("Subscription error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Choose Your Plan
          </h1>

          <p className="mt-2 text-gray-600">
            Unlock SecurePDF Vault features with a paid subscription.
          </p>
        </div>

        <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {plans[0].name}
            </h2>

            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">
                {plans[0].price}
              </span>

              <span className="text-gray-500">
                /{plans[0].period}
              </span>
            </div>
          </div>

          <div className="my-8 space-y-4">
            {plans[0].features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />

                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

