import { getInternalUserId } from "@/app/actions/get-internal-userid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatName = (firstName?: string, lastName?: string): string => {
  return `${firstName || ""} ${lastName || ""}`.trim();
};

export const isUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const getInternalUserIdUtil = () => {
  let userId;
  const asyncWrapper = async () => {
    userId = await getInternalUserId();
  };
  asyncWrapper()
  return userId;
};

export function parseInstructions(instructions: unknown): { step: number; text: string }[] {
  if (!instructions) return []; // Return an empty array if there's no instructions

  try {
    // First, check if instructions is a string that looks like a JSON array
    if (typeof instructions === "string") {
      const parsed = JSON.parse(instructions); // Parse the string into an object/array

      // Ensure the parsed data is an array of objects with the correct structure
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (i) => typeof i === "object" && i !== null && "step" in i && "text" in i
        ) as { step: number; text: string }[];
      }
    }

    // If instructions are already an array, use it directly
    if (Array.isArray(instructions)) {
      return instructions;
    }
  } catch (error) {
    console.error("❌ Error parsing instructions JSON:", error);
  }

  return []; // Return an empty array if parsing fails or if the format is invalid
}
