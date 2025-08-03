"use client";
import Image from "next/image";
import Link from "next/link";


export default function Page() {



  return (
    <main className="h-[100dvh] w-[100dvw] flex flex-col items-center justify-center">
       <h1 className="relative inline-block text-black 
          after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 
          after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 
          hover:after:w-full">Our Products</h1>
       <div className="flex flex-col">
       <span className="flex items-center gap-2">
         <Image 
            src="/VideoCall.png"
            alt="Video call" 
            width={40} 
            height={40} 
            priority 
         />
         <Link href="/video_call" className="relative inline-block text-black 
          after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 
          after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 
          hover:after:w-full">Video Calling Web APP</Link>
        
       </span>
       <span className="flex items-center">
       <Image 
            src="/FileShare.png"
            alt="Video call" 
            width={40} 
            height={40} 
            priority 
            className="rounded-[25%] "
         />
          <Link href="/file_share" className="relative inline-block text-black 
          after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 
          after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 
          hover:after:w-full">File Sharing Web App</Link>
       </span>
       </div>
    </main>
  );
}
