import { siteUrl } from "@/lib/utils";

export async function sendMail(options: {
  to?: string | null;
  subject: string;
  text: string;
  href?: string;
}) {
  if (!options.to || !process.env.SMTP_HOST) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email:console]", {
        to: options.to,
        subject: options.subject,
        href: options.href,
      });
    }
    return { sent: false };
  }

  try {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASSWORD
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
    });
    const link = options.href ? siteUrl(options.href) : undefined;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "AA Maka Production <noreply@aamaka.local>",
      to: options.to,
      subject: options.subject,
      text: link ? `${options.text}\n\n${link}` : options.text,
    });
    return { sent: true };
  } catch (error) {
    console.error("[email:failed]", error);
    return { sent: false };
  }
}
