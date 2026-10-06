const sendSecurePdfLink = async ({
  recipientEmail,
  secureUrl,
  expiresAt,
}) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.EMAIL_FROM ||
        "SecurePDF Vault <noreply@404watch.watch>",
      to: [recipientEmail],
      subject: "Your Secure PDF Link",
      text: `You have received a secure PDF.

Open your document:

${secureUrl}

This link expires on:

${expiresAt.toISOString()}
`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error(
      "Secure PDF link email failed:",
      errorBody
    );

    throw new Error("Failed to send secure PDF link email.");
  }

  const data = await response.json();

  console.log(
    "Secure PDF link email sent successfully through Resend:",
    data.id
  );

  return data;
};

module.exports = {
  sendSecurePdfLink,
};