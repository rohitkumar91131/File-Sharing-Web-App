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