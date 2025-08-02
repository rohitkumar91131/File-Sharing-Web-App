"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.DATABASE_URL);

export default function Page() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🔗 Connected:", socket.id);
    });

    socket.on("message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    console.log("Send")
    socket.emit("message", "Hello from Next.js!");
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">⚡ Next.js + Socket.IO</h1>
      <button
        onClick={sendMessage}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Send
      </button>
      <ul className="mt-4 space-y-2">
        {messages.map((msg, i) => (
          <li key={i} className="p-2 bg-gray-100 rounded text-black">{msg}</li>
        ))}
      </ul>
    </main>
  );
}
