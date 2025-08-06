'use client'
import { useEffect, useState } from "react";
import { useSocket } from "../socket/SocketContext"
import { usePathname } from "next/navigation";
import { useConnection } from "./WebrtcContext";
import { useFile } from "./fileShareContext";

function Fileshare() {
  const {socket ,socketId} = useSocket();
  const [isCopied , setIsCopied] = useState(false);
  const {peerConnectionRef ,mySocketId,setMySocketId ,peerSocketId , setPeerSocketId} = useConnection();
  const [ isConnected , setIsConnected] = useState(true);
  const {fileMetaData , setFileMetaData} = useFile();
  useEffect(()=>{
    setUrl(`${window.location.href}/${socketId}`);
    setMySocketId(socketId);
  },[socketId])

  const [url , setUrl] = useState("");
  const handleShareLinkCopy = ()=>{
    navigator.clipboard.writeText(url)
    setIsCopied(true);
    setTimeout(()=>{
      setIsCopied(false)
    },1000)
  }
  const handleFileChange = (e : React.ChangeEvent<HTMLInputElement> ) =>{
    const file = e.target.files?.[0];
    if(!file) return;
    setFileMetaData({
      name : file.name,
      type : file.type,
      size : file.size
    })
    const metadata = {
      name : file.name,
      type : file.type,
      size : file.size
    }
    if(!socket?.connected){
      alert("Socket not connected");
      return
    }
    if(!peerSocketId){
      alert("Find a receiver for this file by sharing link provided");
      return;
    }
    socket?.emit("send-file-metadata",{peerSocketId ,metadata});
  }
  const sizeFinderForFile = (num: number) => {
    if (num < 1024) {
      return num + " B"
    }
    if (num < 1024 ** 2) {
      return (num / 1024).toFixed(2) + " KB"
    }
    if (num < 1024 ** 3) {
      return (num / 1024 ** 2).toFixed(2) + " MB"
    }
    return (num / 1024 ** 3).toFixed(2) + " GB"
  }
  
  return (
    <div className="flex gap-2 flex-col h-[100vh] w-[100vdw] items-center justify-center">
      <div>
      <input className="border !p-2 rounded-md" type="file" onChange={handleFileChange}/>
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
      <p>File Meta data</p>
      <p>File Name :- {fileMetaData?.name}</p>
      <p>File Size :- {sizeFinderForFile(fileMetaData?.size )}</p>
      <p>File Type :- {fileMetaData?.type}</p>
      <p>My socket Id :- {mySocketId}</p>
      <p>Peer Socket Id :- {peerSocketId && peerSocketId}</p>
      <p>{JSON.stringify(fileMetaData)}</p>
      <p>Peer connection state :- {peerConnectionRef.current && isConnected && peerConnectionRef?.current.connectionState }</p>
    </div>
  )
}

export default Fileshare
