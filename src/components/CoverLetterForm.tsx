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

export const CoverLetterForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDetailsType: "text",
    },
  });

  const fileCVRef = form.register("fileCV");
  const jobDetailsFileRef = form.register("jobDetailsFile");
  const jobDetailsTextRef = form.register("jobDetailsText");

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
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
            <FormItem className="space-y-4">
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

              {field.value === "file" && (
                <FormItem>
                  <FormControl>
                    <Input type="file" {...jobDetailsFileRef} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}

              {field.value === "text" && (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      // className="resize-none"
                      {...jobDetailsTextRef}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
              <FormDescription>
                This is your Job Details information to generate your cover
                letter.
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Generate
        </Button>
      </form>
    </Form>
  );
};
