"use server";

import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "./admin";
import { isUUID } from "@/lib/utils";

export const getInternalUserId = async () => {
        const userId = await requireAuthUser();
    
    // Check if user exists in Prisma
      const internalUser = await prisma.user.findUnique({
        where: { employClerkUserId: userId },
      });
    
      if (!internalUser) {
        console.error("❌ No internal user found for Clerk ID:", userId);
        return null; // Return null instead of throwing an error
      }
    
      // ✅ Validate UUID before querying Prisma
      if (!isUUID(internalUser.id)) {
        console.error("❌ Invalid UUID format for user_id:", userId);
        return null; // Return null instead of throwing an error
      }
      
      return internalUser.id;
}