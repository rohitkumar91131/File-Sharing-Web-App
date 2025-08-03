'use client'
import { useEffect, useState } from "react";
import { useSocket } from "../socket/SocketContext"
import { usePathname } from "next/navigation";

function Fileshare() {
  const {socket ,socketId} = useSocket();
  const [isCopied , setIsCopied] = useState(false);
  useEffect(()=>{
    setUrl(`${window.location.href}/${socketId}`)
  })
  const [url , setUrl] = useState("");
  const handleShareLinkCopy = ()=>{
    navigator.clipboard.writeText(url)
    setIsCopied(true);
    setTimeout(()=>{
      setIsCopied(false)
    },1000)
  }
  return (
    <div className="flex gap-2 flex-col h-[100vh] w-[100vdw] items-center justify-center">
      <div>
      <input className="border !p-2 rounded-md" type="file" />
      <button className="!p-2 border rounded-md active:scale-95 ">Submit</button>
      </div>  
      <div className="flex gap-2">
        <p className="border !p-2 rounded-md">{url ? url : "Establishing socket connection...."}</p>
        <button className="border !p-2 rounded-md active:scale-95"
                onClick={handleShareLinkCopy}
        >
          {!isCopied ? "Copy" : "Copied"}
        </button>
      </div>
    </div>
  )
}

export default Fileshare
