'use client'
import { useSocket } from '@/app/socket/SocketContext';
import React, { use, useEffect } from 'react'

type Id = {
  id : string
}
type JoinRoomResponse = {
  success : boolean,
  msg : string
}
function page({params} : {params : Promise<Id>}) {
  const {id} = use(params);
  const {socket} = useSocket();
  useEffect(()=>{
    if(!id){
      return;
    }
    socket?.connect();
    socket?.on("connect",()=>{
      console.log("connected  :- "+ socket.id)
    })
    
    socket?.emit("join-room-for-file-sharing",id,(res : JoinRoomResponse)=>{
      console.log(res)
    })
  },[])
  console.log()
  return (
    <div>
      This page is to receive usermedia
    </div>
  )
}

export default page
