import { Roles } from "@/types/index";
import { auth } from "@clerk/nextjs/server";

// Define the expected structure for publicMetadata
interface PublicMetadata {
  role?: string;
}

interface SessionClaims {
  publicMetadata?: PublicMetadata;
}

export const getClerkWebhookSecret = (): string => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }
  return secret;
};

export const checkRole = async (role: Roles) => {
  // Type casting sessionClaims to ensure we handle potential undefined values
  const { sessionClaims } = await auth()
  // Safely check if publicMetadata exists and contains the 'role' field
  const userRole = sessionClaims?.metadata?.role;
  return userRole === role;
};
