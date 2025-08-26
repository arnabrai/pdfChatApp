import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-5 justify-center h-[70vh]">
      <h3 className="text-4xl font-bold text-center">
        Welcome to PDF Chat! Your AI-Powered Document Assistant
      </h3>
      <p className="sm:w-[75%] mx-auto text-center text-muted-foreground">
        Transform the way you interact with your PDF documents. Our advanced AI technology
        allows you to have natural conversations with your documents, extract key insights,
        and find answers instantly. Whether you're analyzing research papers, reviewing
        contracts, or studying academic materials, PDF Chat makes document interaction
        seamless and intelligent.
      </p>
      <Link href="/register" className={buttonVariants({ size: "lg" })}>
        Get started
      </Link>
    </div>
  );
}