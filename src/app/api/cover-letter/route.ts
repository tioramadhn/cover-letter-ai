import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/constants/prompt";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Part,
} from "@google/generative-ai";
import {
  GoogleAIFileManager,
  UploadFileResponse,
} from "@google/generative-ai/server";
const generateRandomString = (length: number = 16): string => {
  return crypto.randomBytes(length).toString("hex");
};

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "src/uploads");

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

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY as string
);

const model = genAI.getGenerativeModel({
  // Choose a Gemini model.
  model: "gemini-1.5-flash",
  systemInstruction: SYSTEM_PROMPT,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

const fileManager = new GoogleAIFileManager(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY as string
);

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const data = await req.formData();
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

  const uploadResponseCV = await fileManager.uploadFile(
    `src/uploads/${cvFileName}`,
    {
      mimeType: cvFile.type,
      displayName: cvFile.name,
    }
  );
  console.log(
    `Uploaded file ${uploadResponseCV.file.displayName} as: ${uploadResponseCV.file.uri}`
  );

  let uploadResponseJobDetailsFile: UploadFileResponse | undefined;

  if (jobDetailsType === "file") {
    uploadResponseJobDetailsFile = await fileManager.uploadFile(
      `src/uploads/${jobsDetailsFileName}`,
      {
        mimeType: jobDetailsFile.type,
        displayName: jobDetailsFile.name,
      }
    );
  }

  // View the response.
  console.log(
    `Uploaded file ${uploadResponseJobDetailsFile?.file.displayName} as: ${uploadResponseJobDetailsFile?.file.uri}`
  );

  const jobDetailsContent: Part[] = [
    (data.get("jobDetailsType") as string) === "text"
      ? {
          text: jobDetailsText,
        }
      : uploadResponseJobDetailsFile?.file.mimeType === "application/pdf"
      ? {
          fileData: {
            fileUri: (uploadResponseJobDetailsFile as UploadFileResponse).file
              .uri,
            mimeType: (uploadResponseJobDetailsFile as UploadFileResponse).file
              .mimeType,
          },
        }
      : {
          inlineData: {
            data: Buffer.from(
              fs.readFileSync(`src/uploads/${jobsDetailsFileName}`)
            ).toString("base64"),
            mimeType: (uploadResponseJobDetailsFile as UploadFileResponse).file
              .mimeType,
          },
        },
  ];

  const result = await model.generateContent([
    {
      fileData: {
        fileUri: (uploadResponseCV as UploadFileResponse).file.uri,
        mimeType: (uploadResponseCV as UploadFileResponse).file.mimeType,
      },
    },
    ...jobDetailsContent,
  ]);

  await deleteFile(cvFileName as string);
  if (jobsDetailsFileName) {
    await deleteFile(jobsDetailsFileName);
  }

  return NextResponse.json({ result: result.response.text() });
}
