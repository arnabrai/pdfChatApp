'use client'

import React, { ElementRef, useEffect, useOptimistic, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { chat, newChat } from "@/actions/chat";
import { generateRandomId } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Submit from "@/components/submit";
import { FiUpload } from "react-icons/fi";
import pdfToText from "react-pdftotext";
import { JSONMessage } from "@/types";

type ChatProps = {
  messages: JSONMessage[];
  id: string;
};

export default function Chat({ messages, id }: ChatProps) {
  const scrollRef = useRef<ElementRef<"div">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [pdfName, setPdfName] = useState<string | null>(null);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: string) => [
      ...state,
      {
        answer: undefined,
        id: generateRandomId(4),
        question: newMessage,
      },
    ]
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [optimisticMessages]);

  useEffect(() => {
    // Fetch the existing pdfName when the component mounts
    async function fetchPdfName() {
      try {
        const response = await fetch(`/api/updateConversation?id=${id}`);
        if (!response.ok) throw new Error("Failed to fetch PDF name");
        const data = await response.json();
        setPdfName(data.pdfName || null);
      } catch (error) {
        console.error("Error fetching PDF name:", error);
        setPdfName(null);
      }
    }

    if (id) fetchPdfName();
  }, [id]);

  async function handleSubmit(formData: FormData) {
    const message = formData.get("message") as string;
    if (!message) return;

    const apiKey = localStorage.getItem("apiKey");
    if (!apiKey) {
      toast({
        title: "No API key found!",
        description: 'Please add API key from "My account" section',
      });
      return;
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (id) {
      addOptimisticMessage(message);
      const err = await chat({
        apiKey,
        conversationId: id,
        message,
      });

      if (err?.message) {
        toast({
          title: err.message,
        });
      }
    } else {
      const { message: err } = await newChat({
        apiKey,
        message,
      });

      if (err) {
        toast({
          title: err,
        });
      }
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("Starting file processing...");

    try {
      const text = await pdfToText(file);
      setProgress(100);
      setStatus("Complete!");

      if (inputRef.current) {
        inputRef.current.value = text.trim();
        inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      }

      const formData = {
        id,
        fileName: file.name,
        pdfText: text,
      };

      const response = await fetch("/api/updateConversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update Conversation data");
      }

      setPdfName(file.name);

      toast({
        title: "PDF Processed",
        description: `Extracted ${text.length} characters of text`,
      });
    } catch (error) {
      console.error("PDF Processing Error:", error);
      setStatus("Error processing PDF");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process PDF",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStatus("");
      setIsModalOpen(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="grow">
        <div className="flex flex-col items-start gap-12 pb-10 min-h-[75vh] sm:w-[95%]">
          {optimisticMessages.map((message) => (
            <div className="flex flex-col items-start gap-4" key={message.id}>
              <h4 className="text-xl font-medium dark:text-sky-200 text-sky-700">
                {message.question}
              </h4>
              {!message.answer ? (
                <div className="w-96 flex flex-col gap-3">
                  <Skeleton className="w-[90%] h-[20px] rounded-md" />
                  <Skeleton className="w-[60%] h-[20px] rounded-md" />
                </div>
              ) : (
                <p className="dark:text-slate-300 text-slate-900 whitespace-pre-wrap">
                  {message.answer}
                </p>
              )}
            </div>
          ))}
        </div>
        <div ref={scrollRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background p-4">
        <form
          action={handleSubmit}
          className="flex flex-row items-center gap-2 sm:pr-5"
        >
          <Input
            ref={inputRef}
            autoComplete="off"
            name="message"
            placeholder="Ask me something..."
            className="h-12"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsModalOpen(true)}
            className="p-2"
          >
            <FiUpload size={20} />
          </Button>
          <Submit />
        </form>
      </div>

      <div className="px-4 py-2">
        {pdfName ? (
          <p className="text-sm text-green-600">PDF Uploaded: {pdfName}</p>
        ) : (
          <p className="text-sm text-red-600">No PDF Uploaded</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h2 className="text-xl font-semibold mb-4">Upload a PDF</h2>
            <p className="mb-4">Select a PDF file to upload.</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full p-2 border rounded"
            />
            {isProcessing && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center mt-2">{status}</p>
              </div>
            )}
            <Button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-gray-800 text-white w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
