import { CoverLetterForm } from "@/components/CoverLetterForm";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function Home() {
  return (
    <div className="lg:max-w-screen-lg mx-auto p-6">
      <div>
        <h1 className="font-bold text-2xl ">Cover Letter AI</h1>
        <p>A generator for creating cover letter with AI</p>
      </div>

      <Separator className="my-4" />

      <CoverLetterForm />
    </div>
  );
}
