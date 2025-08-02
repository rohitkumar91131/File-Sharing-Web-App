"use client";
import UserList from "./post/AllUser";
import Button from "./src/Button"
import Button2 from "./src/Button2";



export default function HomePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Button label="Click Me" onClick={() => alert("Hello Next.js + TS")} />
        <Button2/>
    </main>
  );
}