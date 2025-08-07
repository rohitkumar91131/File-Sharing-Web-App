import { read } from "fs";
import { MutableRefObject } from "react";
import { Socket } from "socket.io-client";
type offerRes = {
    success : boolean,
    msg : string,
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

    const channel = pc.createDataChannel("fileChannel")
    channel.onopen = () => console.log("Data channel open");

};

export const startConnection = async(
    peerConnectionRef : MutableRefObject<RTCPeerConnection |  null >,
    peerSocketId : string ,
    socket : Socket 
)=>{
    await createPeerConnection(peerConnectionRef  , peerSocketId , socket);
    if(!peerConnectionRef.current || !peerSocketId || !socket){
        alert("Error in starting function");
        return;
    }
    const offer = await peerConnectionRef.current.createOffer();
    peerConnectionRef.current.setLocalDescription(offer );
    const channel = peerConnectionRef.current.createDataChannel("fileChannel");
    channel.onopen = () => {
        console.log("We are connecting to socket id " + peerSocketId);
        channel.send("Hi");
        // socket.emit("send-file-metadata", {
        //     peerSocketId,
        //     connectionState : peerConnectionRef?.current?.connectionState
        // });
    }
    
    channel.onmessage = (e)=>{
        console.log(e.data)
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
    offer : RTCSessionDescriptionInit
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
    peerConnectionRef.current.ondatachannel = (e)=>{
        const channel = e.channel;
        channel.onopen  = ()=>{
            channel.send("Hello from receiver side");
        }
        channel.onmessage = (e)=>{
            console.log(e.data);
        }
    }
    socket.emit("send-answer",{answer , peerSocketId} , (res : offerRes)=>{
        console.log(res);
    })
}


export const sendFile = (
    peerConnectionRef : MutableRefObject<RTCPeerConnection | null>,
    peerSocketId : string,
    socket : Socket,
    file : File

)=>{
    if(!peerConnectionRef.current) {
        alert("Peer connection not ready");
        return;
    }
    if(!file){
        alert("File not selected")
        return;
    }
    const fileDataChannel = peerConnectionRef.current.createDataChannel("fileDataChannel");
    const chunksize = 1024 * 16;
    let offset = 0;
    const reader = new FileReader();
    reader.onload = (e)=>{
        if(e.target?.result){
            fileDataChannel.send(e.target.result as ArrayBuffer);
            offset += chunksize;
            readSlice();
        }
    }

    const readSlice = () =>{
        const slice = file.slice(offset , offset + chunksize);
        if(slice.size >0){
            reader.readAsArrayBuffer(slice);   
        }
    }
    fileDataChannel.onopen = () =>{

    fileDataChannel.send(
        JSON.stringify({
            name : file.name,
            size : file.size,
            type : file.type,
            isMetaData : true
        })
    )
    readSlice();
    }
}
type incomingFileMetaData = {
    name : string,
    type : string,
    size : number,
    isMetaData : boolean
}
let incomingData : incomingFileMetaData | null = null;
let receivedBuffer : ArrayBuffer[]  = [];
let receivedBytes = 0; 
export const receiveFile = (
    peerConnectionRef : MutableRefObject<RTCPeerConnection | null>,
    socket : Socket,
)=>{
    if(!peerConnectionRef.current){
        alert("peer connection not ready");
        return;
    }

    peerConnectionRef.current.ondatachannel = (e) =>{
        const channel = e.channel;
        channel.onmessage = (e) =>{
            if(typeof e.data === 'string'){
                try{
                    const meta : incomingFileMetaData = JSON.parse(e.data);
                    if(meta.isMetaData){
                        incomingData = meta;
                        receivedBuffer = [],
                        receivedBytes = 0;
                        console.log("Receiveing file",meta.name)
                    }
                }
                catch(err : any){
                    console.log("Invalid metadata ",err.message)
                }
            }
            else if (e.data instanceof ArrayBuffer && incomingData ){
                receivedBuffer.push(e.data);
                receivedBytes += e.data.byteLength;
                console.log(`Received ${receivedBytes}/${incomingData.size} bytes`);
                if (receivedBytes >= incomingData.size) {
                    const blob = new Blob(receivedBuffer, { type: incomingData.type });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = incomingData.name;
                    a.click();
                    incomingData = null;
                    receivedBuffer = [];
                    receivedBytes = 0;
                }
            
        }
    }
}