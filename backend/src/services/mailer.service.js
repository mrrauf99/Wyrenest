import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendVerificationEmail = async ({ to, name, token }) => {
  const link = `${process.env.CLIENT_BASE_URL}/verify-email/${token}`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Verify your Wyrenest account",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for signing up at Wyrenest. Click the link below to verify your email address. This link expires in 15 minutes.</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `,
  });
};

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const link = `${process.env.CLIENT_BASE_URL}/reset-password/${token}`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Reset your Wyrenest password",
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your Wyrenest password. Click the link below to choose a new one. This link expires in 15 minutes.</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
};
