"use server";

import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { Result, handleError, success, ValidationError, NotFoundError, ConflictError } from "@/lib/errors";
import { BankAccountFormData, bankAccountSchema, mapBankAccountToFormData } from "../lib/zod-schemas/bank-account-schema";
import { redis } from "@/lib/redis"; // ✅ Import Redis

const logger = createLogger("bank-account-actions");

const CACHE_EXPIRATION = 600; // 10 minutes

export async function addBankAccount(
  userId: string,
  data: BankAccountFormData
): Promise<Result<BankAccountFormData>> {
  try {
    logger.info("🏦 Adding bank account", { userId });

    if (!userId) throw new ValidationError("User ID is required");

    const validatedData = bankAccountSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      include: { bankAccounts: true }
    });

    if (!user) throw new NotFoundError("User");

    if (user.bankAccounts.length > 0) throw new ConflictError("User already has a bank account");

    const bankAccount = await prisma.bankAccount.create({
      data: { ...validatedData, userId: user.id }
    });

    logger.success("Bank account added successfully", { userId });

    await redis.del(`user:bank:${userId}`); // ✅ Clear cache after creation

    return success(mapBankAccountToFormData(bankAccount));
  } catch (error) {
    return handleError(error);
  }
}

export async function getBankAccount(
  userId: string
): Promise<Result<BankAccountFormData | null>> {
  try {
    logger.info("🔍 Fetching bank account", { userId });

    if (!userId) throw new ValidationError("User ID is required");

    const cacheKey = `user:bank:${userId}`;
    
    // ✅ Check Redis cache first
    const cachedBankAccount = await redis.get(cacheKey);
    if (cachedBankAccount) {
      console.log("🚀 Returning cached bank account");
      return success(cachedBankAccount as BankAccountFormData);
    }

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      include: { bankAccounts: true }
    });

    if (!user) throw new NotFoundError("User");

    const bankAccount = user.bankAccounts[0];
    const mappedData = bankAccount ? mapBankAccountToFormData(bankAccount) : null;

    // ✅ Store in Redis with 10-minute expiration
    if (mappedData) await redis.set(cacheKey, mappedData, { ex: CACHE_EXPIRATION });

    return success(mappedData);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateBankAccount(
  userId: string,
  data: BankAccountFormData
): Promise<Result<BankAccountFormData>> {
  try {
    debugger;
    logger.info("📝 Updating bank account", { userId });

    if (!userId) throw new ValidationError("User ID is required");

    const validatedData = bankAccountSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      include: { bankAccounts: true }
    });

    if (!user) throw new NotFoundError("User");

    if (!user.bankAccounts[0]) throw new NotFoundError("Bank account");

    const updatedAccount = await prisma.bankAccount.update({
      where: { id: user.bankAccounts[0].id },
      data: validatedData
    });

    logger.success("Bank account updated successfully", { userId });

    await redis.del(`user:bank:${userId}`); // ✅ Clear cache after update

    return success(mapBankAccountToFormData(updatedAccount));
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteBankAccount(
  userId: string
): Promise<Result<void>> {
  try {
    logger.info("🗑️ Deleting bank account", { userId });

    if (!userId) throw new ValidationError("User ID is required");

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      include: { bankAccounts: true }
    });

    if (!user) throw new NotFoundError("User");

    if (!user.bankAccounts[0]) throw new NotFoundError("Bank account");

    await prisma.bankAccount.delete({
      where: { id: user.bankAccounts[0].id }
    });

    logger.success("Bank account deleted successfully", { userId });

    await redis.del(`user:bank:${userId}`); // ✅ Clear cache after deletion

    return success(undefined);
  } catch (error) {
    return handleError(error);
  }
}
