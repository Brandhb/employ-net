"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Result } from "@/lib/errors";

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsync<T>() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const execute = useCallback(
    async (
      asyncFunction: () => Promise<Result<T>>,
      options: UseAsyncOptions<T> = {}
    ) => {
      setIsLoading(true);
      try {
        const result = await asyncFunction();

        if (result.success) {
          if (options.successMessage) {
            toast({
              title: "Success",
              description: options.successMessage,
            });
          }
          options.onSuccess?.(result.data as T);
          return result.data;
        } else {
          throw result.error;
        }
      } catch (error: any) {
        const message = error?.message || options.errorMessage || "An error occurred";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        options.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    isLoading,
    execute,
  };
}