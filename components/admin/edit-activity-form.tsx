"use client";

import { useState, useEffect } from "react";
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
import { updateActivity } from "@/app/actions/admin/activities";
import { EditActivityData } from "@/app/lib/types/admin";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Plus,
  Trash,
} from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z
    .enum(["video", "survey", "verification", "ux_ui_test", "ai_image_task"])
    .default("survey"),
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

interface EditActivityFormProps {
  activity: EditActivityData;
  onClose: () => void;
}

// ✅ Component
export function EditActivityForm({ activity, onClose }: EditActivityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  // ✅ Parse Instructions Properly
  function parseInstructions(instructions: any): { step: number; text: string }[] {
    if (!instructions) return [];
    if (typeof instructions === "string") {
      try {
        return JSON.parse(instructions) as { step: number; text: string }[];
      } catch (error) {
        console.error("❌ Error parsing instructions JSON:", error);
        return [];
      }
    }
    if (Array.isArray(instructions)) return instructions;
    return [];
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...activity,
      instructions: activity.instructions, // Ensure instructions are an array
    },
  });

   // ✅ Manage Instructions as an Ordered List
   const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  // ✅ Ensure existing instructions are loaded into the form
  useEffect(() => {
    if (activity) {
      const formattedActivity = {
        ...activity,
        instructions: parseInstructions(activity.instructions),
      };
      form.reset(formattedActivity);
      replace(formattedActivity.instructions); // Ensure FieldArray updates
    }
  }, [activity, form, replace]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("🟢 Updating Activity:", values);
    setIsLoading(true);
    try {
      const response = await updateActivity(activity.id, values);
      if (!response.success) {
        throw new Error(response.error || "Activity update failed");
      }
      toast({ title: "Success", description: "Activity updated successfully" });
      onClose(); // Close modal after successful update
    } catch (error) {
      console.error("❌ Update Error:", error);
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
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Activity</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <SelectItem value="ux_ui_test">UX/UI Test</SelectItem>
                      <SelectItem value="ai_image_task">
                        AI Image Task
                      </SelectItem>
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
          </div>

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

          {/* Advanced Fields (Collapsible) */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-primary hover:underline"
            >
              {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter activity description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Instructions - Dynamic List */}
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
              onClick={() =>
                append({ step: fields.length + 1, text: "" })
              }
            >
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-auto" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Activity"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
