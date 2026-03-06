const { SendMailClient } = require("zeptomail");
import config from "@/config";

let client = null;

const getClient = () => {
  if (!client) {
    const token = config.zeptomail.token;
    if (!token) {
      console.warn("ZEPTOMAIL_TOKEN is not configured. Emails will not be sent.");
      return null;
    }

    const fullToken = token.startsWith("Zoho-enczapikey")
      ? token
      : `Zoho-enczapikey ${token}`;

    client = new SendMailClient({
      url: "https://api.zeptomail.com/v1.1/email",
      token: fullToken,
    });
  }
  return client;
};

export const sendEmail = async ({ to, subject, text, html, replyTo, unsubscribeUrl }) => {
  const emailClient = getClient();

  if (!emailClient) {
    console.warn("ZeptoMail not configured. Email would be sent to:", to);
    return { mock: true };
  }

  try {
    const from = {
      address: config.zeptomail.fromAddress,
      name: config.zeptomail.fromName,
    };

    const toAddresses = Array.isArray(to)
      ? to.map((address) => ({ email_address: { address, name: address } }))
      : [{ email_address: { address: to, name: to } }];

    const headers = {};
    if (unsubscribeUrl) {
      headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }

    const response = await emailClient.sendMail({
      from,
      to: toAddresses,
      subject,
      htmlbody: html,
      ...(text && { textbody: text }),
      ...(replyTo && { reply_to: { address: replyTo, name: replyTo } }),
      ...(Object.keys(headers).length > 0 && { headers }),
    });

    console.log("Email sent successfully via ZeptoMail to:", to);
    return response;
  } catch (error) {
    console.error("Error sending email via ZeptoMail:", error);
    throw error;
  }
};
