import { auth, clerkClient } from "@clerk/nextjs/server";

export const isAdmin = async () => {
    const { userId } = await auth()
    const { users } = await clerkClient();
    const user = await users.getUser(userId || "");
    const isAdmin = user.publicMetadata.role === "admin";
    return isAdmin;
}