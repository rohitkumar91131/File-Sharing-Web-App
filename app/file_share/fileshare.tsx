'use client'
import { useEffect, useState, useMemo } from "react";
import { useSocket } from "../socket/SocketContext"
import { useConnection } from "./WebrtcContext";
import { useFile } from "./fileShareContext";
import { sendFileMetaData } from "./fileShareRef";

function Fileshare() {
  const { socket, socketId } = useSocket();
  const [isCopied, setIsCopied] = useState(false);
  const { peerConnectionRef, dataChannelRef, mySocketId, setMySocketId, peerSocketId } = useConnection();
  const { file  ,fileMetaData, setFileMetaData } = useFile();
  
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.href}/${socketId}`);
    setMySocketId(socketId);
  }, [socketId, setMySocketId]);

  const handleShareLinkCopy = () => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };
  useEffect(()=>{
    console.log("File meta data change")
  },[fileMetaData])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFile = e.target.files?.[0];
    if (!inputFile) return;
    console.log(inputFile)
    const metadata = {
      name: inputFile.name,
      type: inputFile.type,
      size: inputFile.size
    };

    setFileMetaData(metadata);
    file.current = inputFile;
    console.log(file.current);
    sendFileMetaData(peerConnectionRef, dataChannelRef, metadata );
  };

  const sizeFinderForFile = (num?: number) => {
    if (!num) return "-";
    if (num < 1024) return num + " B";
    if (num < 1024 ** 2) return (num / 1024).toFixed(2) + " KB";
    if (num < 1024 ** 3) return (num / 1024 ** 2).toFixed(2) + " MB";
    return (num / 1024 ** 3).toFixed(2) + " GB";
  };

  const metadataDisplay = useMemo(() => (
    <>
      <p>File Meta data</p>
      <p>File Name :- {fileMetaData?.name}</p>
      <p>File Size :- {sizeFinderForFile(fileMetaData?.size)}</p>
      <p>File Type :- {fileMetaData?.type}</p>
      <p>{JSON.stringify(fileMetaData)}</p>
    </>
  ), [fileMetaData]);

  return (
    <div className="flex gap-2 flex-col h-[100vh] w-[100vdw] items-center justify-center">
      <div>
        <input className="border !p-2 rounded-md" type="file" onChange={handleFileChange} />
        <button className="!p-2 border rounded-md active:scale-95">Submit</button>
      </div>  
      
      <div className="flex gap-2">
        <p className="border !p-2 rounded-md">
          {url || "Establishing socket connection...."}
        </p>
        <button 
          className="border !p-2 rounded-md active:scale-95"
          onClick={handleShareLinkCopy}
        >
          {!isCopied ? "Copy" : "Copied"}
        </button>
      </div>

      {metadataDisplay}

      <p>My socket Id :- {mySocketId}</p>
      <p>Peer Socket Id :- {peerSocketId || "-"}</p>
      <p>Peer connection state :- {peerConnectionRef.current?.connectionState || "-"}</p>
      <p>{JSON.stringify(file?.current?.name )}</p>
    </div>
  );
}

export default Fileshare;
