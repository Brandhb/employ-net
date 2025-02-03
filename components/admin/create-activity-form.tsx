"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
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
import { createActivity } from "@/app/actions/admin";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["video", "survey"]),
  points: z.number().min(1, "Points must be at least 1"),
  description: z.string().optional(),
  metadata: z.object({
    playbackId: z.string().optional(),
    formId: z.string().optional()
  }).optional()
});

export function CreateActivityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "video",
      points: 100,
      description: "",
      metadata: {}
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await createActivity(values);
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: JSON.stringify(error) || "Failed to create activity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter points value"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Points awarded for completing this activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Activity"}
        </Button>
      </form>
    </Form>
  );
}