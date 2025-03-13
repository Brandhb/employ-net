"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CreateActivityData } from "@/app/lib/types/admin";
import { ChevronDown, ChevronUp, Plus, Trash, ClipboardList } from "lucide-react";

// ✅ Schema (Includes Ordered Instructions as an Array)
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["video", "survey", "verification"]),
  status: z.enum(["active", "draft"]).default("draft"),
  points: z.coerce.number().min(1, "Points must be at least 1"),
  description: z.string().optional(),
  instructions: z
    .array(
      z.object({
        step: z.number(),
        text: z.string().min(1, "Step description is required"),
      })
    )
    .optional(),
  metadata: z
    .object({
      playbackId: z.string().optional(),
      formId: z.string().optional(),
    })
    .optional(),
});

// ✅ Component
export function CreateActivityForm({ onSubmit }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "survey",
      status: "draft",
      points: 100,
      description: "",
      instructions: [],
      metadata: {},
    },
  });

  // ✅ Manage Instructions as an Ordered List
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  // ✅ Submitting form
  async function handleSubmit(values: CreateActivityData) {
    console.log("🟢 Submitting Form:", values);
    setIsLoading(true);

    try {
      const response = await onSubmit(values);

      if (!response.success) {
        throw new Error(response.error || "Activity creation failed");
      }

      toast({ title: "Success", description: "Activity created successfully" });
      form.reset();
    } catch (error) {
      console.error("❌ Submission Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Create Activity</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Grid Layout for Core Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter activity title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="verification">Verification</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Points */}
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter points" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Instructions - Dynamic List */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <FormLabel className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Instructions
            </FormLabel>

            <p className="text-sm text-muted-foreground mb-4">
              Add step-by-step instructions for this activity.
            </p>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  {/* Step Number */}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {index + 1}.
                  </span>

                  {/* Instruction Input */}
                  <Input
                    placeholder={`Step ${index + 1}`}
                    {...form.register(`instructions.${index}.text`)}
                    className="flex-1"
                  />

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Step Button */}
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full flex items-center justify-center gap-2"
              onClick={() => append({ step: fields.length + 1, text: "" })}
            >
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Activity"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
