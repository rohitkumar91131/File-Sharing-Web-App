"use client"

import { useContext, useRef } from "react";
import { createContext } from "react"

type webRTCType = {
    myConnectionRef : React.MutableRefObject<RTCPeerConnection | null>
    peerConnectionRef : React.MutableRefObject<RTCPeerConnection | null>

}
const WebRTCConnectionContext  = createContext<webRTCType | undefined>(undefined);

export const WebRtcConnectionProvider = ({children} : { children : React.ReactNode}) =>{
    const myConnectionRef = useRef<RTCPeerConnection | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null >(null);
    const value : webRTCType = {
        myConnectionRef,
        peerConnectionRef
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