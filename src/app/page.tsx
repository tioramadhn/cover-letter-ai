import { CoverLetterForm } from "@/components/CoverLetterForm";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <MaxWidthWrapper>
      <div>
        <h1 className="font-bold text-2xl ">Cover Letter AI</h1>
        <p>A generator for creating cover letter with AI</p>
      </div>

      <Separator className="my-4" />

      <CoverLetterForm />
    </MaxWidthWrapper>
  );
}
