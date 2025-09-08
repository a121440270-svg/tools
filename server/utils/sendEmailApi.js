// utils/sendEmail.js
export async function sendEmailApi({ to, subject, text, html, from }) {
  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: {
        email: from?.email || "noreply@example.com",
        name: from?.name || "My Worker",
      },
      subject,
      content: [
        {
          type: "text/plain",
          value: text || "",
        },
        ...(html
          ? [
              {
                type: "text/html",
                value: html,
              },
            ]
          : []),
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
  }

  return await response.json().catch(() => ({})); // MailChannels 有时返回空
}
