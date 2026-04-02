import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


const sesClient = new SESv2Client({});

const AUTHENTICATOR_EMAIL_SENDER = "authenticator@notalonesoldier.shalev396.com";

function plainFromHtml(html: string): string {
  const t = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return t || "(See HTML version of this message.)";
}

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
  retryCount = 0
): Promise<{ MessageId?: string }> => {
  const from = AUTHENTICATOR_EMAIL_SENDER;
  const textBody = text.trim() ? text : plainFromHtml(html);
  try {
    const out = await sesClient.send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [to] },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
              Text: { Data: textBody, Charset: "UTF-8" },
              ...(html.trim() ? { Html: { Data: html, Charset: "UTF-8" } } : {}),
            },
          },
        },
      })
    );
    return { MessageId: out.MessageId ?? undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("SES sendEmail:", msg);
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS * (retryCount + 1));
      return sendEmail(to, subject, text, html, retryCount + 1);
    }
    throw new Error(
      `Email send failed after ${MAX_RETRIES} attempts: ${msg}`
    );
  }
};
