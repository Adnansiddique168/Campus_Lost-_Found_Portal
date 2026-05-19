import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
  let transporter;
  let isTestAccount = false;

  // Use actual SMTP if configured
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail', // Standard configuration for Gmail
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // Fallback to ethereal email for testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isTestAccount = true;
  }

  try {
    const info = await transporter.sendMail({
      from: '"Campus Portal" <noreply@campusportal.com>',
      to,
      subject,
      text,
      html,
    });

    if (isTestAccount) {
      console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email: ", error);
    return { success: false, error };
  }
}
