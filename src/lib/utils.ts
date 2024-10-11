import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const animationStreamText = {
  hide: { y: 16, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
  },
};

export const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1]; // Get the base64 part
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function getMessagesFromStream(data: string) {
  // Regular expression to extract message parts
  const regex = /0:"(.*?)"/g;

  let match;
  const messages: string[] = [];

  // Extract message parts
  while ((match = regex.exec(data)) !== null) {
    messages.push(match[1]);
  }

  // Join all the message parts into one string
  // const fullMessage = messages.join("").split("\\n").join("");
  const fullMessage = messages.join("").replaceAll(/\\n/g, "");
  return fullMessage;
}

export const getBaseUrl = () => {
  switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    case "production":
      return "https://cover-letter.tioramadhn.dev";
    case "preview":
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    default:
      return `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
};
