"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

// ✅ Schema (No Test URL for Verification)
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["video", "survey", "verification"]),
  status: z.enum(["active", "draft"]).default("draft"),
  points: z.coerce.number().min(1, "Points must be at least 1"),
  description: z.string().optional(),
  metadata: z
    .object({
      playbackId: z.string().optional(), // Video metadata
      formId: z.string().optional(), // Survey metadata
    })
    .optional(),
});

// ✅ Response Type
interface CreateActivityResponse {
  success: boolean;
  error?: string;
}

// ✅ Component
export function CreateActivityForm({ onSubmit }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "survey",
      status: "draft",
      points: 100,
      description: "",
      metadata: {},
    },
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                <Input
                  type="number"
                  placeholder="Enter points"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter activity description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video Playback ID (for Video type) */}
        {form.watch("type") === "video" && (
          <FormField
            control={form.control}
            name="metadata.playbackId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Playback ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Mux playback ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Typeform ID (for Survey type) */}
        {form.watch("type") === "survey" && (
          <FormField
            control={form.control}
            name="metadata.formId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typeform ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Typeform ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Activity"}
        </Button>
      </form>
    </Form>
  );
}
