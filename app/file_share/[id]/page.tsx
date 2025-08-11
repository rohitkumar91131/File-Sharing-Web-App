'use client'
import { useSocket } from '@/app/socket/SocketContext'
import {MutableRefObject, use, useEffect, useState } from 'react'
import { useConnection } from '../WebrtcContext'
import { acceptConnection, sendFile, sendFileMetaData, startConnection } from '../fileShareRef'
import { isBuiltin } from 'module'
import { Mutable } from 'next/dist/client/components/router-reducer/router-reducer-types'
import { useFile } from '../fileShareContext'

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
  const { peerConnectionRef ,mySocketId  , setMySocketId,peerSocketId , setPeerSocketId , dataChannelRef} = useConnection();
  const [status , setStatus] = useState<string | null>(null);
  const [downloadbutton , setDownloadButton] = useState({
    name : "Download",
    isDisabled : false
  });
  const [receivedFileMetaData , setReceivedFileMetaData] = useState<receivedFileType>({
    name : "",
    size : 0,
    type : ""
  });
  const {fileMetaData , setFileMetaData} = useFile();
  useEffect(()=>{
    console.log(fileMetaData)
  },[fileMetaData])
  useEffect(()=>{
    if(!peerConnectionRef.current) return;
    peerConnectionRef.current.onconnectionstatechange = ()=>{
      console.log(peerConnectionRef.current?.connectionState);
      const s = peerConnectionRef.current?.connectionState
      setStatus(s ?? null);
    }
  },[status])
  type sendFileEventType = {
    success : boolean,
    msg : string
  }
  const handleDownload = (
    peerConnectionRef : MutableRefObject<RTCPeerConnection | null>,
    dataChannelRef : MutableRefObject<RTCDataChannel | null>
  ) => {
     if(!peerConnectionRef.current){
      alert("peer connection isnt ready yet");
      return;
     }
     if(peerConnectionRef.current.connectionState !== "connected"){
      alert("Peer connection is "+peerConnectionRef.current.connectionState);
      return;
     }
     if(!dataChannelRef.current){
      alert("Data channel isnt ready yet");
      return
     }
     if(dataChannelRef.current?.readyState !== "open"){
      alert("Data channel is "+ dataChannelRef.current?.readyState);
      return;
     }
     dataChannelRef.current.send("Send file");
     setDownloadButton({
      name : "Downloading....",
      isDisabled : false
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

    socket?.on("receive-offer",async({offer ,peerSocketId})=>{
      console.log(offer);
      await acceptConnection(peerConnectionRef , peerSocketId , socket,offer,dataChannelRef , setReceivedFileMetaData);
    })

    socket.on("ice-candidate",async(res)=>{
      console.log(res);
      if(!peerConnectionRef.current) return;
      await peerConnectionRef.current.addIceCandidate(res?.candidate);
    })

    socket.on("file-meta-data-sended",(data)=>{
      setReceivedFileMetaData(data);
    
    })


    socket.on("file-sended",id=>{
      
    })
    return () => {
      socket.off('connect');   
      socket.disconnect();
      socket.off("receive-offer");
      socket.off("ice-candidate");
      socket.off("file-meta-data-sended")
    }
  }, [id]);
  // useEffect(()=>{
  //   if(!peerSocketId || !socket) return;
  //   //startConnection(peerConnectionRef , peerSocketId , socket ,dataChannelRef )
  // },[peerSocketId])
  const handleSendFileMetaData = () =>{
    console.log("Clicked")
    if(!peerConnectionRef.current){
      alert("Peer connection isnt ready yet");
      return;
    }
    if(peerConnectionRef.current?.connectionState !== "connected"){
      alert("Peer connection is "+ peerConnectionRef.current.connectionState);
      return;
    }
    if(!dataChannelRef.current){
      alert("Data channel isnt ready yet");
      return;
    }
    if(dataChannelRef.current?.readyState !== "open"){
      alert("Data channel is "+ dataChannelRef.current.readyState);
      return;
    }
    dataChannelRef.current.send("send file metadata")
  }
  return (
    <div className="h-[100dvh] w-[100dvw] flex flex-col items-center justify-center">
      <button
        onClick={() => handleDownload(peerConnectionRef, dataChannelRef)}
        disabled={downloadbutton?.isDisabled}
        className={`p-2 rounded-md border transition 
          ${clicked ? 'bg-red-500 cursor-not-allowed hover:cursor-not-allowed' : 'bg-green-500 cursor-pointer hover:bg-green-600'}
        `}
      >
        {downloadbutton ? downloadbutton?.name : "Download"}
      </button>
      <button onClick={handleSendFileMetaData} className='!p-2 bg-red-500 rounded-md'>Send file metadata</button>
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
