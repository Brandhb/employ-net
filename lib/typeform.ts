import { createClient } from "@typeform/api-client";

const typeform = createClient({
  token: process.env.TYPEFORM_ACCESS_TOKEN,
});

export async function getTypeformResponse(formId: string) {
  try {
    const response = await typeform.responses.list({
      uid: formId,
    });
    return response;
  } catch (error) {
    console.error("Error fetching Typeform response:", error);
    throw error;
  }
}

export async function createTypeformWebhook(formId: string, webhookUrl: string) {
  try {
    const webhook = await typeform.webhooks.create({
      uid: formId,
      tag: "survey-completion",
      url: webhookUrl,
      enabled: true,
      verifySSL: true, // Corrected property name
    });
    return webhook;
  } catch (error) {
    console.error("Error creating Typeform webhook:", error);
    throw error;
  }
}
