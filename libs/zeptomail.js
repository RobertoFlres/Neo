import config from "@/config";

export const sendEmail = async ({ to, subject, text, html, replyTo, unsubscribeUrl }) => {
  const token = config.zeptomail.token?.trim();

  if (!token) {
    console.warn("ZEPTOMAIL_TOKEN is not configured. Emails will not be sent.");
    return { mock: true };
  }

  try {
    const cleanToken = token.replace(/\s+/g, "");
    const fullToken = cleanToken.startsWith("Zoho-enczapikey")
      ? cleanToken
      : `Zoho-enczapikey ${cleanToken}`;

    const toAddresses = Array.isArray(to)
      ? to.map((address) => ({ email_address: { address, name: address } }))
      : [{ email_address: { address: to, name: to } }];

    const body = {
      from: {
        address: config.zeptomail.fromAddress,
        name: config.zeptomail.fromName,
      },
      to: toAddresses,
      subject,
      htmlbody: html,
    };

    if (text) body.textbody = text;
    if (replyTo) body.reply_to = { address: replyTo, name: replyTo };

    const response = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": fullToken,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("ZeptoMail API error:", data);
      throw new Error(data.message || `ZeptoMail error: ${response.status}`);
    }

    console.log("Email sent successfully via ZeptoMail to:", to);
    return data;
  } catch (error) {
    console.error("Error sending email via ZeptoMail:", error);
    throw error;
  }
};
