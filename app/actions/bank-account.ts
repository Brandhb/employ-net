"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { Result, handleError, success, ValidationError, NotFoundError, ConflictError } from "@/lib/erorrs";

const logger = createLogger("bank-account-actions");

// Validation schema with more specific rules
export const bankAccountSchema = z.object({
  bankName: z.string()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name must be less than 100 characters")
    .trim(),
  accountNumber: z.string()
    .min(4, "Account number must be at least 4 characters")
    .max(30, "Account number must be less than 30 characters")
    .regex(/^\d+$/, "Account number must contain only digits"),
  routingNumber: z.string()
    .length(9, "Routing number must be exactly 9 digits")
    .regex(/^\d+$/, "Routing number must contain only digits"),
  accountType: z.enum(["checking", "savings"], {
    errorMap: () => ({ message: "Please select either checking or savings" })
  }),
  accountHolderName: z.string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name must be less than 100 characters")
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, "Account holder name can only contain letters, spaces, hyphens, and apostrophes"),
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

// Helper function to map database bank account to form data
function mapBankAccountToFormData(bankAccount: any): BankAccountFormData {
  return {
    bankName: bankAccount.bankName,
    accountNumber: bankAccount.accountNumber,
    routingNumber: bankAccount.routingNumber,
    accountType: bankAccount.accountType as "checking" | "savings",
    accountHolderName: bankAccount.accountHolderName,
  };
}

export async function addBankAccount(
  userId: string,
  data: BankAccountFormData
): Promise<Result<BankAccountFormData>> {
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