'use client'
import { useEffect, useState } from "react"
import Fileshare from "./fileshare"
import { useSocket } from "../socket/SocketContext"
import { useRouter } from "next/navigation";
import { useConnection } from "./WebrtcContext";
import { acceptConnection, sendFile, sendFileMetaData, startConnection,  } from "./fileShareRef";
import { useFile } from "./fileShareContext";


type JoinRoomResponse = {
  success : boolean,
  msg : string
}
function page() {
    const {socket , socketId , setSocketId} = useSocket();
    const { peerConnectionRef , mySocketId , setMySocketId ,peerSocketId , setPeerSocketId , dataChannelRef } = useConnection();
    const [status , setStatus] = useState();
    const {fileMetaData ,setFileMetaData} = useFile();
    useEffect(()=>{
      if(!socket) return
      if(!peerConnectionRef.current) return;
      peerConnectionRef.current.onconnectionstatechange = ()=>{
        console.log(peerConnectionRef.current?.connectionState)
      }
      alert(socket.id)
    },[])
    const router = useRouter();
    useEffect(()=>{
      if(!socket) return;
        socket?.connect();
        socket?.on("connect",()=>{
          const id = socket.id;
          if(!id){
            return;
          }
          setSocketId(id);
          setMySocketId(id);
        })

        socket?.on("got-peer-socket-id",(res)=>{
          console.log(res);
          setPeerSocketId(res?.peerSocketId)
          if(res.success){
            startConnection(peerConnectionRef , res?.peerSocketId , socket ,dataChannelRef  , ()=>sendFileMetaData(peerConnectionRef , dataChannelRef, fileMetaData));
          }
        })

        socket?.once("receive-answer",async(res)=>{
          console.log(res);
          if(!peerConnectionRef.current) return;
          await peerConnectionRef.current.setRemoteDescription( new RTCSessionDescription(res.answer) )
        })
    



        socket.once("ice-candidate",async(res)=>{
          console.log(res);
          if(!peerConnectionRef.current) return;
          await peerConnectionRef.current.addIceCandidate(res?.candidate)
        })


        async function checkBackend(){
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/checkBackend`);
          const data = await res.json();
          console.log(data);
          console.log(process.env.NEXT_PUBLIC_BACKEND_API_URL) ;
          console.log(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/checkBackend`)
        }

        checkBackend();
        console.log(process.env.NEXT_PUBLIC_BACKEND_API_URL) ;
        console.log(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/checkBackend`)

      
        return ()=>{
            socket?.disconnect();
            socket?.off("got-peer-socket-id");
            socket?.off("receive-answer");
            socket.off("ice-candidate");
            socket.off("get-file-metadata");
        }
    },[])
  return (
    <div className="w-[100dvw] h-[100dvh] flex items-center justify-center">
      <Fileshare/>
      <p>sid {socket && socket.id}</p>
    </div>
  )
}

export default page
