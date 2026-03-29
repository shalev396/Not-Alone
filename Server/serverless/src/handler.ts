import { timingSafeEqual } from "crypto";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

const FROM = "authenticator@notalonesoldier.shalev396.com";
const ses = new SESv2Client({});

const json = (code: number, body: object): APIGatewayProxyResultV2 => ({
  statusCode: code,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

function plainFromHtml(html: string): string {
  const t = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return t || "(See HTML version of this message.)";
}

function secretOk(headers: APIGatewayProxyEventV2["headers"]): boolean {
  const want = process.env.EMAIL_SENDER_SECRET;
  if (!want || !headers) return false;
  const h = headers.authorization ?? headers.Authorization;
  if (!h?.startsWith("Bearer ")) return false;
  const got = h.slice(7);
  if (got.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (event.requestContext?.http?.method !== "POST") {
    return json(405, { error: "POST only" });
  }
  if (!secretOk(event.headers)) return json(401, { error: "Unauthorized" });

  let body: { to?: string; subject?: string; text?: string; html?: string };
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body ?? "", "base64").toString("utf8")
      : (event.body ?? "");
    body = JSON.parse(raw) as typeof body;
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const to = body.to ?? "";
  const subject = body.subject ?? "";
  const text = body.text ?? "";
  const html = body.html ?? "";
  if (!to || !subject || (!text.trim() && !html.trim())) {
    return json(400, { error: "Missing to, subject, and text or html" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return json(400, { error: "Invalid to address" });
  }

  const textBody = text.trim() ? text : plainFromHtml(html);
  try {
    const out = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: FROM,
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
    return json(200, { messageId: out.MessageId ?? null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("SES:", msg);
    return json(502, { error: msg });
  }
};
