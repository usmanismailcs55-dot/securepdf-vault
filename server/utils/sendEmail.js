const sendMail = async ({ from, to, subject, text }) => {
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
      from: from || process.env.EMAIL_FROM,
      to: [to],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Resend email failed:", errorBody);

    throw new Error("Failed to send email.");
  }

  const data = await response.json();

  console.log("Email sent successfully through Resend:", data.id);

  return data;
};

module.exports = {
  sendMail,
};