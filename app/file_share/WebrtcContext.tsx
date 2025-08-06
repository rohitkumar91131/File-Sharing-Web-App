"use client"

import { useContext, useRef, useState } from "react";
import { createContext } from "react"

type webRTCType = {
    peerConnectionRef : React.MutableRefObject<RTCPeerConnection | null>,
    mySocketId : string | null ,
    peerSocketId : string | null,
    setMySocketId : React.Dispatch<React.SetStateAction<string | null>>,
    setPeerSocketId : React.Dispatch<React.SetStateAction<string | null>>
}
const WebRTCConnectionContext  = createContext<webRTCType | undefined>(undefined);

export const WebRtcConnectionProvider = ({children} : { children : React.ReactNode}) =>{
    const peerConnectionRef = useRef<RTCPeerConnection | null >(null);
    const [mySocketId , setMySocketId] = useState<string | null>(null);
    const [peerSocketId , setPeerSocketId] = useState<string | null>(null);
    const value : webRTCType = {
        peerConnectionRef,
        mySocketId,
        peerSocketId,
        setMySocketId,
        setPeerSocketId
    }
    return (
        <WebRTCConnectionContext.Provider value={value}>
            {children}
        </WebRTCConnectionContext.Provider>
    )
}

export const useConnection = () => {
    const context = useContext(WebRTCConnectionContext);
    if(!context){
         throw new Error("Connection Not ready")
    }
    return context;
}