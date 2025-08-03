'use client'
import { useEffect } from "react"
import Fileshare from "./fileshare"
import { useSocket } from "../socket/SocketContext"
import { useRouter } from "next/navigation";


type JoinRoomResponse = {
  success : boolean,
  msg : string
}
function page() {
    const {socket , socketId , setSocketId} = useSocket();
    const router = useRouter();
    useEffect(()=>{
        socket?.connect();
        socket?.on("connect",()=>{
          console.log(socket.id)
            const id  = socket.id;
            if(!id){
              alert("No socket id")
            }
            if(id){
              setSocketId(id);
            }
            console.log(socketId)
            //router.push(`file_share/${socket.id}`)
        })

        socket?.emit("join-room-for-file-sharing",socket.id , (res : JoinRoomResponse)=>{
          console.log(res);
        })

        return ()=>{
            socket?.disconnect();
        }

        
    },[])
  return (
    <div className="w-[100dvw] h-[100dvh] flex items-center justify-center">
      <Fileshare/>
    </div>
  )
}

export default page
