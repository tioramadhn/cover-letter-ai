import { z } from "zod";

export const formSchema = z.object({
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
            ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
          {
            message: "File type must be JPEG, PNG, or PDF",
          }
        )
    ),
  jobDetailsType: z.string(),
  jobDetailsFile: z
    .unknown()
    .transform((value) => {
      return value as FileList;
    })
    .refine((files) => files && files?.length > 0, {
      message: "Please upload your Job Details.",
    })
    .transform((files) => files[0])
    .pipe(
      z
        .instanceof(File)
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
          {
            message: "File type must be JPEG, PNG, or PDF",
          }
        )
    ),
  jobDetailsText: z.string().optional(),
});
