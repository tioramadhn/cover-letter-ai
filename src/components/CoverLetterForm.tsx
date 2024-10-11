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
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { CopyIcon } from "@radix-ui/react-icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";

export const CoverLetterForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDetailsType: "text",
    },
  });
  const [generation, setGeneration] = useState<string>();
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
      const { data } = await axios.post("/api/cover-letter", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(data);

      setGeneration(() => data?.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-6">
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
                <FormLabel>Vacancy Detail</FormLabel>
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
                        placeholder="Tell us about your vacancy..."
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
      <div className="flex flex-col relative gap-8 md:space-y-0 bg-muted rounded-md p-4 min-h-[409px]">
        {!generation && !loading && (
          <div className="flex  h-full justify-center items-center">
            <p className="text-center text-sm text-muted-foreground">
              No cover letter generated.
            </p>
          </div>
        )}
        {generation && (
          <>
            <CopyToClipboard text={generation} onCopy={() => toast("Copied ")}>
              <Button
                className="self-end absolute right-0 top-0 flex gap-2"
                variant={"outline"}
                size={"sm"}
              >
                <CopyIcon />
                Copy
              </Button>
            </CopyToClipboard>
            <Separator className="md:hidden" />
            <p className="whitespace-pre-wrap prose  ">{generation}</p>
          </>
        )}

        {loading && (
          <div className="flex flex-col h-full  justify-between">
            <div className="space-y-6">
              <Skeleton className="w-1/3 h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-4/5 h-8" />
            </div>
            <div className="space-y-6">
              <Skeleton className="w-1/4 h-8" />
              <Skeleton className="w-1/3 h-8" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
