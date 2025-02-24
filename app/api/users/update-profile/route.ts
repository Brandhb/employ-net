// app/api/update-profile/route.ts
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Processing profile update request...`);

  try {
    const { userId, fullName, email } = await req.json();
    
    if (!userId || !fullName || !email) {
      console.error(`[${requestId}] Missing required fields.`);
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    // Split fullName into firstName and lastName
    const [firstName, ...lastNameParts] = fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ") || "";
    const { users } = await clerkClient()

    // Get the user's current data from Clerk
    const user = await users.getUser(userId);
    const primaryEmailAddressId = user.primaryEmailAddressId;
    const existingEmail = user.emailAddresses.find(e => e.id === primaryEmailAddressId)?.emailAddress;

    // Step 1: Update name
    await users.updateUser(userId, {
      firstName,
      lastName,
    });

    // Step 2: Update email separately if it's different
    if (existingEmail !== email) {
      console.log(`[${requestId}] Updating email from ${existingEmail} to ${email}...`);
      
      const existingEmailEntry = user.emailAddresses.find(e => e.emailAddress === email);
      if (existingEmailEntry) {
        // If the email is already associated with the user, set it as primary
        await users.updateUser(userId, { primaryEmailAddressID: existingEmailEntry.id });
      } else {
        // Otherwise, add the new email and set it as primary
        const { emailAddresses } = await clerkClient()
        const newEmail = await emailAddresses.createEmailAddress({ userId, emailAddress: email });
        
        await users.updateUser(userId, { primaryEmailAddressID: newEmail.id });
      }
    }

    console.log(`[${requestId}] Successfully updated profile for userId: ${userId}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`[${requestId}] Error updating profile:`, error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
