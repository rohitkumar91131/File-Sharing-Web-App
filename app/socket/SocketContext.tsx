"use client"
import { createContext, useContext, useState } from "react";
import { io, Socket } from 'socket.io-client'


type socketType = {
    socket : Socket | null,
    socketId : string ,
    setSocketId : ( id : string) => void
}
const SocketContext = createContext<socketType | undefined>(undefined);

export const SocketProvider = ({children} : { children : React.ReactNode}) =>{
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_API_URL);
    const [socketId , setSocketId] = useState<string>("connecting-socket");
    const value : socketType ={
        socket,
        socketId,
        setSocketId
    }
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () =>{
    const context = useContext(SocketContext);
    if(!context){
        throw new Error("Socket not ready");
    }
    return context;
}

