import { read } from "fs";
import { Mutable } from "next/dist/client/components/router-reducer/router-reducer-types";
import { MutableRefObject } from "react";
import { Socket } from "socket.io-client";
type offerRes = {
    success : boolean,
    msg : string,
}
type FileType = {
    name : string,
    size : number,
    type : string
}
export const createPeerConnection = (
    peerConnectionRef : MutableRefObject<RTCPeerConnection | null>,
    peerSocketId : string ,
    socket : Socket ,
) =>{
    if(!peerSocketId || !socket){
        alert("Error in creating connection")
        return;
    }
    let pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    peerConnectionRef.current = pc;
    pc.onicecandidate = (event) =>{
        if(event.candidate && peerSocketId){
            socket.emit("ice-candidate",{
                candidate : event.candidate,
                to : peerSocketId
            },(res : offerRes)=>{
                console.log(res )
            })
        }
    }


};

export const startConnection = async(
    peerConnectionRef : MutableRefObject<RTCPeerConnection |  null >,
    peerSocketId : string ,
    socket : Socket,
    dataChannelRef : MutableRefObject<RTCDataChannel | null>,
    sendFileMetaData : () => void
)=>{
    await createPeerConnection(peerConnectionRef  , peerSocketId , socket);
    if(!peerConnectionRef.current || !peerSocketId || !socket){
        alert("Error in starting function");
        return;
    }
    const channel = peerConnectionRef.current.createDataChannel("fileChannel");
    dataChannelRef.current = channel;
    channel.onopen = () => console.log("Data channel open");
    const offer = await peerConnectionRef.current.createOffer();
    peerConnectionRef.current.setLocalDescription(offer);

    channel.onopen = () =>{
        console.log("Channel connected");
        //channel.send("Hi this is receiver of file")
    }

    channel.onmessage = (e) =>{
        console.log(e.data);
        if(e.data === "send file metadata"){
           //alert("send file metadata");
            sendFileMetaData();
        }

    }

    socket.emit("send-offer",({peerSocketId , offer }) ,(res : offerRes)=>{
        console.log(res);
    })
}

type RTCSessionDescriptionInit = {
    type : RTCSdpType ,
    sdp : string
}
export const acceptConnection = async(
    peerConnectionRef : MutableRefObject<RTCPeerConnection | null>,
    peerSocketId : string,
    socket : Socket,
    offer : RTCSessionDescriptionInit,
    dataChannelRef : MutableRefObject<RTCDataChannel | null >,
    setReceivedFileMetaData : React.Dispatch<React.SetStateAction<FileType>>,
) =>{
    await createPeerConnection(peerConnectionRef  , peerSocketId , socket);
    if(!peerConnectionRef.current || !peerSocketId || !socket){
        alert("Error in accepting connection");
        return;
    }
    await peerConnectionRef.current.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    console.log(answer);
    socket.emit("send-answer",{answer , peerSocketId} , (res : offerRes)=>{
        console.log(res);
    });


    peerConnectionRef.current.ondatachannel = (e) =>{
        const channel = e.channel;
        dataChannelRef.current = e.channel;
        console.log(dataChannelRef.current)
        channel.onmessage = (e)=>{
            if(typeof e.data === "string"){
                const msg = JSON.parse(e.data);
                if(msg.type === "metaData"){
                    const msg = JSON.parse(e.data);
                    //alert("You sent a file metadata")
                    console.log(msg);
                    const { name , type , size } = msg?.fileMetaData
                    console.log(name , type , size);
                    setReceivedFileMetaData({
                        name ,
                        size, 
                        type
                    })
                }
            }

        }
    }
}


export const sendFile = (
    peerConnectionRef : MutableRefObject<RTCPeerConnection |null>,
    dataChannelRef : MutableRefObject<RTCDataChannel | null>,
)=>{
    if(!peerConnectionRef.current){
        alert("Peer connection isnt ready yet");
        return
    }
    if(!dataChannelRef.current){
        alert("Data channel not formed yet");
        return;
    }
    

    if (dataChannelRef.current.readyState === "open") {
        //dataChannelRef.current.send("Hi from receiver");

      } else {
        alert("Data channel not open yet");
      }
}

export const sendFileMetaData = (
    peerConnectionRef : MutableRefObject<RTCPeerConnection | null>,
    dataChannelRef : MutableRefObject<RTCDataChannel | null>,
    fileMetaData : FileType
) =>{
    if(!peerConnectionRef.current){
        alert("Peer connection not ready yet");
        return
    }
    if(dataChannelRef.current?.readyState !== "open"){
        alert("Data channel is not ready");
        return
    }
    console.log("file meta data " +JSON.stringify(fileMetaData))
    //console.log(dataChannelRef.current);
    const fileMetaDataMessage = {
        fileMetaData : { ...fileMetaData },
        type : "metaData"
    }
    dataChannelRef.current.send(JSON.stringify(fileMetaDataMessage));
}    