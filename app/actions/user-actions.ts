"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function getUserVerificationStep(employClerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        employClerkUserId,
      },
      select: {
        verificationStep: true,
      },
    });

    return user?.verificationStep;
  } catch (error) {
    console.error("Error fetching user verification step:", error);
    throw new Error("Failed to fetch user verification step");
  }
}

export const getClerkUserObject = async () => {
  const user = await currentUser();
  return user;
};

export const getEmails = async () => {
  const user = await currentUser();
  // Transform the email addresses into plain objects
  const emails = user?.emailAddresses.map((email) => ({
    id: email.id,
    emailAddress: email.emailAddress,
  }));
  return emails || [];
};

export async function checkVerificationStep() {
  debugger;
  try {
    const user = await getClerkUserObject();
    if (!user) {
      return { verified: false, reason: "User not authenticated" };
    }

    const employClerkUserId = user?.id;
    // Extract email addresses and get the first email
    const emails = await getEmails(); // Fetch emails
    console.log("emails:", emails);
    console.log(user.id);

    if (!emails || emails.length === 0) {
      return { verified: false, reason: "There are no email addresses" };
    }

    // Call the server action to fetch the verification step
    const verificationStep = await getUserVerificationStep(employClerkUserId);

    // Ensure the verificationStep is properly accessed
    if (!verificationStep || verificationStep !== 1) {
      return { verified: false, reason: "User verification incomplete" };
    }

    return { verified: true };
  } catch (error) {
    console.error("Error in checkVerificationStep:", error);
    return { verified: false, reason: "Server error" };
  }
}

export const getDbUser = async (userId: string) => {
 // const clerkUser = await currentUser();
  //const userId = clerkUser?.id;
  const dbUser = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
  });
  return dbUser;
};
