"use server";

import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { Result, handleError, success, ValidationError, NotFoundError, ConflictError } from "@/lib/erorrs";
import { BankAccountFormData, bankAccountSchema, mapBankAccountToFormData } from "../lib/zod-schemas/bank-account-schema";

const logger = createLogger("bank-account-actions");

export async function addBankAccount(
  userId: string,
  data: BankAccountFormData
): Promise<Result<BankAccountFormData>> {
  debugger;
  try {
    logger.info("🏦 Adding bank account", { userId });

    // Validate user ID
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Validate input data
    const validatedData = bankAccountSchema.parse(data);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      include: { bankAccounts: true }
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // Check if user already has a bank account
    if (user.bankAccounts.length > 0) {
      throw new ConflictError("User already has a bank account");
    }

    // Create bank account
    const bankAccount = await prisma.bankAccount.create({
      data: {
        ...validatedData,
        userId: user.id
      }
    });

    logger.success("Bank account added successfully", { userId });

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

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      include: { bankAccounts: true }
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const bankAccount = user.bankAccounts[0];
    return success(bankAccount ? mapBankAccountToFormData(bankAccount) : null);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateBankAccount(
  userId: string,
  data: BankAccountFormData
): Promise<Result<BankAccountFormData>> {
  try {
    logger.info("📝 Updating bank account", { userId });

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Validate input data
    const validatedData = bankAccountSchema.parse(data);

    // Find user and their bank account
    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      include: { bankAccounts: true }
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!user.bankAccounts[0]) {
      throw new NotFoundError("Bank account");
    }

    // Update bank account
    const updatedAccount = await prisma.bankAccount.update({
      where: { id: user.bankAccounts[0].id },
      data: validatedData
    });

    logger.success("Bank account updated successfully", { userId });

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

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      include: { bankAccounts: true }
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!user.bankAccounts[0]) {
      throw new NotFoundError("Bank account");
    }

    await prisma.bankAccount.delete({
      where: { id: user.bankAccounts[0].id }
    });

    logger.success("Bank account deleted successfully", { userId });

    return success(undefined);
  } catch (error) {
    return handleError(error);
  }
}