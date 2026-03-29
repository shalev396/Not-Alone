const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type SendEmailResult = { MessageId?: string };

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
  retryCount = 0
): Promise<SendEmailResult> => {
  if (!to || !subject || (!text.trim() && !html.trim())) {
    throw new Error(
      "Missing required fields: 'to', 'subject', and either 'text' or 'html'."
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error("Invalid email format");
  }

  const url = process.env.EMAIL_SENDER_URL;
  const secret = process.env.EMAIL_SENDER_SECRET;
  if (!url || !secret) {
    throw new Error("EMAIL_SENDER_URL and EMAIL_SENDER_SECRET must be set");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ to, subject, text, html }),
  });

  let data: { messageId?: string | null; error?: string } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS * (retryCount + 1));
      return sendEmail(to, subject, text, html, retryCount + 1);
    }
    throw new Error(
      data.error || `Email sender failed after ${MAX_RETRIES} attempts (${res.status})`
    );
  }

  return { MessageId: data.messageId ?? undefined };
};
