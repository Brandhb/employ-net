import { prisma } from "@/lib/prisma";
import { formatName } from "@/lib/utils";
import { WebhookEvent } from "@clerk/nextjs/server";

export const handleEvent = async (evt: WebhookEvent) => {
  const { type: eventType, data } = evt;

  switch (eventType) {
    case "user.created":
      await handleUserCreated(data);
      break;
    case "user.updated":
      await handleUserUpdated(data);
      break;
    case "user.deleted":
      await handleUserDeleted(data);
      break;
    default:
      throw new Error(`Unhandled event type: ${eventType}`);
  }
};

const handleUserCreated = async (data: any) => {
  const { id, email_addresses, first_name, last_name } = data;
  const name = formatName(first_name, last_name);

  if (!id || !email_addresses) {
    throw new Error("Error occurred -- missing data");
  }

  console.log('employClerkUserId: ', id);
  console.log('email_addresses[0].email_address: ', email_addresses[0].email_address);
  console.log('first_name: ', first_name);
  console.log('last_name: ', last_name);
  console.log('name: ', name);
  console.log('id: ', id);

  await prisma.user.create({
    data: {
      employClerkUserId: id,
      name,
      email: email_addresses[0].email_address,
      veriffStatus: 'pending',  // New users start with pending verification
    },
  });

  console.log(`User created with ID: ${id}`);
};

const handleUserUpdated = async (data: any) => {
  const { id, email_addresses, first_name, last_name } = data;
  const name = formatName(first_name, last_name);

  await prisma.user.update({
    where: { employClerkUserId: id },
    data: {
      name,
      email: email_addresses[0].email_address,  // Ensure email is handled correctly
    },
  });

  console.log(`User updated with ID: ${id}`);
};

const handleUserDeleted = async (data: any) => {
  const { id } = data;

  await prisma.user.delete({
    where: { employClerkUserId: id },
  });

  console.log(`User deleted with ID: ${id}`);
};
