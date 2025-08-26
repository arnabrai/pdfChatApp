'use server'

import { getUser } from "@/lib/auth";
import { generateRandomId } from "@/lib/utils";
import prisma from "@/prisma/client";
import { JsonMessagesArraySchema } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Groq } from "groq-sdk";

export type Message = {
  message: string;
  apiKey: string;
  conversationId: string;
};

export type NewMessage = Omit<Message, "conversationId">;

export async function newChat(params: NewMessage) {
  const session = await getUser();
  if (!session?.user) redirect("/login");

  let id: string | undefined;
  let error: undefined | { message: string };

  try {
    const responseMessage = await createCompletion(
      params.apiKey,
      params.message,
      null
    );

    const newConversationId = generateRandomId(8);
    const newMessageJson = [
      {
        id: newConversationId,
        question: params.message,
        answer: responseMessage.message.content,
      },
    ];

    const dataRef = await prisma.conversation.create({
      data: {
        messages: newMessageJson,
        name: params.message,
        userId: session.user.id,
      },
    });
    id = dataRef.id;
  } catch (err) {
    if (err instanceof Error) error = { message: err.message };
  }

  if (error) return error;
  redirect(`/chat/${id}`);
}

export async function chat(params: Message) {
  let error: undefined | { message: string };

  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.conversationId,
      },
    });

    const responseMessage = await createCompletion(
      params.apiKey,
      params.message,
      conversation?.pdfText || ""
    );

    const newConversationId = generateRandomId(8);
    const updatedMessageJson = [
      ...JsonMessagesArraySchema.parse(conversation?.messages),
      {
        id: newConversationId,
        question: params.message,
        answer: responseMessage.message.content,
      },
    ];

    await prisma.conversation.update({
      where: {
        id: params.conversationId,
      },
      data: {
        messages: updatedMessageJson,
      },
    });
  } catch (err) {
    if (err instanceof Error) error = { message: err.message };
  }

  if (error) return error;
  revalidatePath(`/chat/${params.conversationId}`);
}

declare global {
  var groq_map: undefined | Map<string, Groq>;
}

const map = globalThis.groq_map ?? new Map<string, Groq>();

async function createCompletion(apiKey: string, message: string, pdfText: string | null) {
  let groq: Groq;

  if (map.has(apiKey)) {
    groq = map.get(apiKey)!;
  } else {
    groq = new Groq({
      apiKey,
    });
    map.set(apiKey, groq);
  }


  const systemPrompt = pdfText 
    ? `You are a helpful AI assistant. Use the following PDF content as context to answer questions. Only answer based on this context. If the question cannot be answered from this context, say so clearly.

Context:
${pdfText}` 
    : "You are a helpful AI assistant.";

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ],
    model: "mixtral-8x7b-32768",
  });

  return completion.choices[0];
}