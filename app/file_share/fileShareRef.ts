import { channel } from "diagnostics_channel";
import { read } from "fs";
import { Mutable } from "next/dist/client/components/router-reducer/router-reducer-types";
import { off } from "process";
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
    sendFileMetaData : () => void,
    file : MutableRefObject<File | null>,
    sendFile : (
        peerConnectionRef: MutableRefObject<RTCPeerConnection | null>,
        dataChannelRef: MutableRefObject<RTCDataChannel | null>,
        file : MutableRefObject<File | null>
    ) => void
 
)=>{
    await createPeerConnection(peerConnectionRef  , peerSocketId , socket);
    if(!peerConnectionRef.current || !peerSocketId || !socket){
        alert("Error in starting function");
        return;
    }
    const channel = peerConnectionRef.current.createDataChannel("fileChannel");
    dataChannelRef.current = channel;
    //channel.onopen = () => console.log("Data channel open");
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
        if(e.data === "Send file"){
            console.log(file?.current)
            sendFile(peerConnectionRef , dataChannelRef , file);
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
        console.log(dataChannelRef.current);
        channel.onopen = () =>{
            receiveFile(peerConnectionRef , dataChannelRef)
        }
        channel.onmessage = (e)=>{
            //console.log(e.data)
            if(typeof e.data === "string"){
                const msg = JSON.parse(e.data);
                //console.log("J",msg)
                if(msg.type === "metaData"){
                    const msg = JSON.parse(e.data);
                    //alert("You sent a file metadata")
                    //console.log(msg);
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
    file : MutableRefObject<File | null>
)=>{
    if(!peerConnectionRef.current){
        alert("Peer connection isnt ready yet");
        return
    }
    if(!dataChannelRef.current){
        alert("Data channel not formed yet");
        return;
    }
    if(dataChannelRef.current.readyState !== "open"){
        alert("Data channel is "+ dataChannelRef.current.readyState);
        return;
    }
    console.log(file.current);
    const channel  : RTCDataChannel= dataChannelRef.current
    if(!file.current){
        alert("Select a file");
        return;
    }
    const actualFile : File = file.current;
    let chunksize = 16 * 1024;
    let offset = 0;
    let reader = new FileReader();
    function readSlide ( o : number ){
        const slice = actualFile.slice(o , o+chunksize);
        console.log(slice);
        reader.readAsArrayBuffer(slice);
    }
    reader.onload = (e) =>{
        const buffer = e.target!.result as ArrayBuffer;
        if(channel.bufferedAmount  > 16_000_000){
            setTimeout(() => reader.onload!(e), 10);
            return;
        }

        channel.send(buffer);
        offset += buffer.byteLength;
        console.log(buffer);
        console.log(offset);

        if(offset < actualFile.size){
            readSlide(offset);
        }
       else {
         channel.send(
            JSON.stringify({
                type : "file",
                msg : "EOF",
                filename : actualFile.name
            })
         )
         console.log("File sent successfully")
       }
    }
    readSlide(0)
}

let receivedBuffers: ArrayBuffer[] = [];
export const receiveFile = (
    peerConnectionRef: MutableRefObject<RTCPeerConnection | null>,
    dataChannelRef: MutableRefObject<RTCDataChannel | null>
) => {
    if (!peerConnectionRef.current) {
        alert("Peer connection isn't ready yet for receiving file");
        return;
    }
    if (!dataChannelRef.current) {
        alert("Data channel isn't formed yet for receiving file");
        return;
    }
    if (dataChannelRef.current.readyState !== "open") {
        alert("Data channel state is " + dataChannelRef.current.readyState);
        return;
    }

    dataChannelRef.current.onmessage = (e) =>{
        let chunk = e.data;
        if(chunk instanceof ArrayBuffer){
            //console.log("Receiving array buffer", e.data);
            receivedBuffers.push(e.data);
        }
        //console.log(receivedBuffers)
        if(typeof e.data === "string"){
            const msg = JSON.parse(e.data);
            if(msg.type === "file" && msg.msg === "EOF"){
                console.log(msg)
                const blob = new Blob(receivedBuffers);
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download=msg.filename,
                link.click();
                alert("File downloaded successfully")
            }
        }
    }
};

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