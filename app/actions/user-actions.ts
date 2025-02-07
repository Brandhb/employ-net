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
  try {
    const user = await getClerkUserObject();
    if (!user) {
      console.error("User not authenticated.");
      return { verified: false, reason: "User not authenticated" };
    }

    const employClerkUserId = user.id;

    // Extract email addresses
    const emails = await getEmails();
    if (!emails || emails.length === 0) {
      console.error("No email addresses found for user:", employClerkUserId);
      return { verified: false, reason: "No email addresses associated with account" };
    }

    console.log("Checking verification step for user:", employClerkUserId);

    let verificationStep;
    let attempts = 3; // Retry mechanism in case of DB sync delay

    while (attempts > 0) {
      verificationStep = await getUserVerificationStep(employClerkUserId);
      if (verificationStep !== undefined && verificationStep === 1) break;

      console.warn(`Attempt ${4 - attempts}: Verification step not found. Retrying...`);
      await new Promise((res) => setTimeout(res, 1000)); // Wait before retrying
      attempts--;
    }

    if (!verificationStep || verificationStep !== 1) {
      console.warn("User verification incomplete after retries:", employClerkUserId);
      return { verified: false, reason: "User verification incomplete" };
    }

    console.log("User verification successful:", employClerkUserId);
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
