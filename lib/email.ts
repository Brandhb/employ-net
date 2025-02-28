import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!); // Get API Key from .env

// ✅ Function to send job failure alerts
export async function sendJobFailureAlert(jobName: string, errorMessage: string) {
  try {
    await resend.emails.send({
      from: "support@employ-net.com",
      to: "support@employ-net.com",
      subject: `🚨 Job Failure Alert: ${jobName}`,
      html: `
        <h2>Job Failed: ${jobName}</h2>
        <p>Error Message: <strong>${errorMessage}</strong></p>
        <p>Check the BullMQ dashboard for more details.</p>
      `,
    });

    console.log(`📧 Job failure alert sent for ${jobName}`);
  } catch (error) {
    console.error("❌ Failed to send job failure email:", error);
  }
}

export async function sendNotificationEmail(to: string, subject: string, html: string) {
  try {
    const response = await resend.emails.send({
      from: "Employ-Net <noreply@employ-net.com>", // ✅ Ensure your domain is verified
      to,
      subject,
      html,
    });

    if (!response || response.error) {
      console.error("Failed to send email:", response?.error || "Unknown error");
      return null;
    }

    console.log("✅ Email sent successfully to", to);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return null;
  }
}
