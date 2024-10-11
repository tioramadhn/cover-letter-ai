"use client";

import { formSchema } from "@/validation/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import { useState } from "react";
import { getMessagesFromStream } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
export const CoverLetterForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDetailsType: "text",
    },
  });
  const [generation, setGeneration] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fileCVRef = form.register("fileCV");
  const jobDetailsFileRef = form.register("jobDetailsFile");
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setGeneration("");
    setLoading(true);
    const formData = new FormData();

    formData.append("fileCV", values.fileCV);
    formData.append("jobDetailsType", values.jobDetailsType);
    if (values.jobDetailsType === "file") {
      formData.append("jobDetailsFile", values.jobDetailsFile as Blob);
    } else {
      formData.append("jobDetailsText", values.jobDetailsText as string);
    }

    try {
      const { data: stream } = await axios.post("/api/cover-letter", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "stream",
      });

      console.log({ stream });

      for await (const chunk of stream) {
        setGeneration((prev: string) => (prev + chunk) as string);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="fileCV"
            render={() => (
              <FormItem>
                <FormLabel>CV / Resume</FormLabel>
                <FormControl>
                  <Input type="file" {...fileCVRef} />
                </FormControl>
                <FormDescription>
                  This is your CV or Resume as base knowledge.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobDetailsType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Detail</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="text" />
                      </FormControl>
                      <span className="font-normal text-sm">Text</span>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="file" />
                      </FormControl>
                      <span className="font-normal text-sm">File</span>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            {form.watch("jobDetailsType") === "text" && (
              <FormField
                control={form.control}
                name="jobDetailsText"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your job"
                        className="resize-none -mt-4"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("jobDetailsType") === "file" && (
              <FormField
                control={form.control}
                name="jobDetailsFile"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        {...jobDetailsFileRef}
                        className="-mt-4"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormDescription>
              This is your job details to create your cover letter.
            </FormDescription>
          </FormItem>

          <Button disabled={loading} type="submit" className="w-full">
            {loading ? "Generating..." : "Generate"}
          </Button>
        </form>
      </Form>
      <div className="space-y-8">
        {generation && (
          <>
            <Separator />
            <h2 className="text-2xl font-bold">Cover Letter</h2>
            <p className="whitespace-pre-wrap prose bg-muted rounded-md p-4 ">
              {getMessagesFromStream(generation)}
            </p>
          </>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
