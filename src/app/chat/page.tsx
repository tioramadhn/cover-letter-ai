"use client";

import useScrollToRef from "@/hooks/useScrollToRef";
import { useChat } from "ai/react";
import { useRef } from "react";
import { motion } from "framer-motion";
import { animationStreamText } from "@/lib/utils";
export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
  });
  const chatRef = useRef(null);
  useScrollToRef(chatRef, messages);
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <motion.div
          initial="hide"
          animate="show"
          transition={{ delayChildren: 0.6, staggerChildren: 0.025 }}
          key={m.id}
          className="whitespace-pre-wrap"
        >
          {m.role === "user" ? "User: " : "AI: "}
          {m.toolInvocations ? (
            <pre>{JSON.stringify(m.toolInvocations, null, 2)}</pre>
          ) : (
            <motion.p variants={animationStreamText}>{m.content}</motion.p>
          )}
        </motion.div>
      ))}

      <div ref={chatRef} />

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
