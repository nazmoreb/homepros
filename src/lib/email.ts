import "server-only";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type EmailResult = {
  provider: "console" | "resend";
  status: "LOGGED" | "SENT" | "FAILED";
  detail: string;
};

export interface EmailProvider {
  readonly name: "console" | "resend";
  send(message: EmailMessage): Promise<EmailResult>;
}

class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console" as const;

  async send(message: EmailMessage): Promise<EmailResult> {
    console.info(
      `\n[HomePros email:console]\nTo: ${message.to}\nSubject: ${message.subject}\n${message.text}\n`,
    );
    return { provider: "console", status: "LOGGED", detail: "Logged to the server console." };
  }
}

class ResendEmailProvider implements EmailProvider {
  readonly name = "resend" as const;

  constructor(private readonly apiKey: string, private readonly from: string) {}

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!response.ok) {
        return {
          provider: "resend",
          status: "FAILED",
          detail: body.message || `Resend responded ${response.status}.`,
        };
      }
      return { provider: "resend", status: "SENT", detail: body.id ? `Resend id ${body.id}` : "Sent." };
    } catch (error) {
      return {
        provider: "resend",
        status: "FAILED",
        detail: error instanceof Error ? error.message : "Resend request failed.",
      };
    }
  }
}

export function getEmailProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "HomePros <leads@homepros.cartley.com>";
  if (apiKey) return new ResendEmailProvider(apiKey, from);
  return new ConsoleEmailProvider();
}
