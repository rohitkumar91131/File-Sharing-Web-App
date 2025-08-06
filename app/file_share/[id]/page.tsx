'use client'
import { useSocket } from '@/app/socket/SocketContext'
import {use, useEffect, useState } from 'react'
import { useConnection } from '../WebrtcContext'
import { startConnection } from '../fileShareRef'
import { isBuiltin } from 'module'

type Id = {
  id: string
}
type JoinRoomResponse = {
  success: boolean
  msg: string,
  peerSocketId : string
}

type receivedFileType = {
  name : string,
  size : number,
  type : string
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

function Page({ params }: { params: Promise<Id> }) {
  const { id } = use(params)
  const [clicked, setClicked] = useState(false)
  const { socket } = useSocket();
  const { peerConnectionRef ,mySocketId  , setMySocketId,peerSocketId , setPeerSocketId} = useConnection();
  const [status , setStatus] = useState<string | null>(null);
  const [downloadbutton , setDownloadButton] = useState({
    name : "Download",
    isDisabled : false
  });
  const [receivedFileMetaData , setReceivedFileMetaData] = useState<receivedFileType>({
    name : "",
    size : 0,
    type : ""
  })
  useEffect(()=>{
    if(!peerConnectionRef.current) return;
    peerConnectionRef.current.onconnectionstatechange = ()=>{
      console.log(peerConnectionRef.current?.connectionState);
      const s = peerConnectionRef.current?.connectionState
      setStatus(s ?? null);
    }
  },[status])
  const handleDownload = () => {
    console.log("Clicked")
    setDownloadButton({
      name : "Sending the download request",
      isDisabled : true
    })
  }

  useEffect(() => {
    if (!id || !socket) return;
    socket.connect();

    socket.on('connect', ()=>{
      console.log("Socket connected :- "+ socket.id);
      const sid = socket.id;
      setMySocketId(socket.id ?? null);

    socket.emit('send-socket-id-to-sender', id, (res: JoinRoomResponse) => {
      //console.log(res);
      if(!res.success){
        alert("Failed to send socket id");
        return;
      }
       setPeerSocketId(res?.peerSocketId);
    })
    })

    socket?.once("receive-answer",async(res)=>{
      console.log(res);
      if(!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription( new RTCSessionDescription(res.answer) )
    })

    socket.on("ice-candidate",async(res)=>{
      console.log(res);
      if(!peerConnectionRef.current) return;
      await peerConnectionRef.current.addIceCandidate(res?.candidate);
    })

    socket.on("file-meta-data-sended",(data)=>{
      setReceivedFileMetaData(data);
    
    })
    return () => {
      socket.off('connect');   
      socket.disconnect();
      socket.off("receive-answer");
      socket.off("ice-candidate");
      socket.off("file-meta-data-sended")
    }
  }, [id]);
  useEffect(()=>{
    if(!peerSocketId || !socket) return;
    startConnection(peerConnectionRef , peerSocketId , socket)
  },[peerSocketId])

  return (
    <div className="h-[100dvh] w-[100dvw] flex flex-col items-center justify-center">
      <button
        onClick={handleDownload}
        disabled={downloadbutton?.isDisabled}
        className={`p-2 rounded-md border transition 
          ${clicked ? 'bg-red-500 cursor-not-allowed hover:cursor-not-allowed' : 'bg-green-500 cursor-pointer hover:bg-green-600'}
        `}
      >
        {downloadbutton ? downloadbutton?.name : "Download"}
      </button>
      <p>{JSON.stringify(receivedFileMetaData)}</p>
      <p>My socket Id :- {mySocketId}</p>
      <p>Peer Socket Id :- {peerSocketId && peerSocketId}</p>
      <p>Connection Status :- {
        status
        }</p>
    </div>
  )
}

export default Page
