import { streamText, UserContent } from "ai";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/constants/prompt";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const generateRandomString = (length: number = 16): string => {
  return crypto.randomBytes(length).toString("hex");
};

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads");

const extensions: Record<string, string> = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

async function uploadFile(file: File) {
  if (!file) {
    return;
  }

  const fileName = generateRandomString(10) + "." + extensions[file.type];
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR);
    }

    fs.writeFileSync(path.resolve(UPLOAD_DIR, fileName), buffer);
    console.log("File uploaded successfully:", file.name, fileName);

    return fileName;
  } catch (error) {
    console.log({ error });
  }
}

async function deleteFile(fileName: string) {
  if (fs.existsSync(path.resolve(UPLOAD_DIR, fileName))) {
    fs.unlinkSync(path.resolve(UPLOAD_DIR, fileName));
  }
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const host = req.headers.get("host") || "localhost";
  const data = await req.formData();

  data.forEach((value, key) => {
    console.log({ key, value });
  });

  const cvFile = data.get("fileCV") as File;
  const jobDetailsType = data.get("jobDetailsType") as string;
  const jobDetailsFile = data.get("jobDetailsFile") as File;
  const jobDetailsText = data.get("jobDetailsText") as string;

  if (jobDetailsType === "file" && !jobDetailsFile) {
    return NextResponse.json(
      {
        error: "Please upload your Job Details.",
      },
      {
        status: 400,
      }
    );
  }

  const cvFileName = await uploadFile(cvFile);

  const jobsDetailsFileName =
    jobDetailsType === "file" ? await uploadFile(jobDetailsFile) : undefined;

  const urlJobsDetailsFile = `http://${host}/uploads/${jobsDetailsFileName}`;
  const urlCV = `http://${host}/uploads/${cvFileName}`;

  const jobDetailsContent: UserContent = [
    (data.get("jobDetailsType") as string) === "text"
      ? {
          type: "text",
          text: jobDetailsText,
        }
      : {
          type: "file",
          mimeType: jobDetailsFile.type,
          data: urlJobsDetailsFile,
        },
  ];

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "file",
            mimeType: cvFile.type,
            data: urlCV,
          },
          ...jobDetailsContent,
        ],
      },
    ],
  });

  await deleteFile(cvFileName as string);
  if (jobsDetailsFileName) {
    await deleteFile(jobsDetailsFileName);
  }

  return result.toDataStreamResponse();
}
