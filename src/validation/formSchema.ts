import { z } from "zod";

export const formSchema = z
  .object({
    fileCV: z
      .unknown()
      .transform((value) => {
        return value as FileList;
      })
      .refine((files) => files && files?.length > 0, {
        message: "Please upload your CV.",
      })
      .transform((files) => files[0])
      .pipe(
        z
          .instanceof(File)
          .refine(
            (file) =>
              ["image/jpeg", "image/png", "application/pdf"].includes(
                file.type
              ),
            {
              message: "File type must be JPEG, PNG, or PDF",
            }
          )
      ),
    jobDetailsType: z.enum(["text", "file"]),
    jobDetailsFile: z
      .unknown()
      .transform((value) => {
        return (value as FileList)[0];
      })

      .optional(),
    jobDetailsText: z.string().optional(),
  })
  .superRefine(
    ({ jobDetailsType, jobDetailsFile, jobDetailsText }, refineContext) => {
      if (jobDetailsType === "file" && !jobDetailsFile) {
        refineContext.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please upload your Job Details.",
        });
      }

      if (jobDetailsType === "text" && !jobDetailsText) {
        refineContext.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter your Job Details.",
          path: ["jobDetailsText"],
        });
      }

      if (jobDetailsType === "file" && jobDetailsFile) {
        //File type check
        if (
          !["image/jpeg", "image/png", "application/pdf"].includes(
            jobDetailsFile.type
          )
        ) {
          refineContext.addIssue({
            code: z.ZodIssueCode.custom,
            message: "File type must be JPEG, PNG, or PDF",
            path: ["jobDetailsFile"],
          });
        }
      }

      return true;
    }
  );
