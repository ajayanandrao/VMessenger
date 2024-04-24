import React, { useEffect, useRef, useState } from 'react';
import { collection, doc, addDoc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../Firebase';
import "./VideoCall.scss";
import { v4 } from 'uuid';

const VideoCall = () => {

    const webcamVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callId, setCallId] = useState('');
    const peerConnectionSaveRef = useRef(null);

    const [showRemoteVideo, setShowRemoteVideo] = useState(false);

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const handleStartWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            webcamVideoRef.current.srcObject = stream;
            const pc = new RTCPeerConnection(servers);
            peerConnectionSaveRef.current = pc; // Save peer connection instance
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    if (remoteStream) {
                        remoteStream.addTrack(track);
                    } else {
                        const newRemoteStream = new MediaStream();
                        newRemoteStream.addTrack(track);
                        setRemoteStream(newRemoteStream);
                        remoteVideoRef.current.srcObject = newRemoteStream;
                    }
                });
            };

            // Rest of the logic...
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };


    const callButtonHandler = async () => {
        try {
            const callId = document.getElementById('callInput').value;
            const callDocRef = doc(db, 'calls', callId);
            const offerCandidatesRef = collection(callDocRef, 'offerCandidates');
            const answerCandidatesRef = collection(callDocRef, 'answerCandidates');

            const pc = peerConnectionSaveRef.current; // Access saved peer connection instance

            pc.onicecandidate = (event) => {
                event.candidate && addDoc(offerCandidatesRef, event.candidate.toJSON());
            };

            // Create offer
            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);

            const offer = {
                sdp: offerDescription.sdp,
                type: offerDescription.type,
            };

            await setDoc(callDocRef, { offer });

            // Listen for remote answer
            onSnapshot(callDocRef, (snapshot) => {
                const data = snapshot.data();
                if (!pc.currentRemoteDescription && data?.answer) {
                    const answerDescription = new RTCSessionDescription(data.answer);
                    pc.setRemoteDescription(answerDescription);
                }
            });

            // When answered, add candidate to peer connection
            onSnapshot(answerCandidatesRef, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        pc.addIceCandidate(candidate);
                    }
                });
            });

            // Disable call button after initiating the call
            const hangupButton = document.getElementById('hangupButton');
            if (hangupButton) {
                hangupButton.disabled = false;
            }
        } catch (error) {
            console.error('Error initiating call:', error);
        }
    };



    // const handleAnswerButton = async () => {
    //     try {
    //         const callId = document.getElementById('callInput').value;
    //         const callDocRef = doc(db, 'calls', callId);
    //         const answerCandidatesRef = collection(callDocRef, 'answerCandidates');
    //         const offerCandidatesRef = collection(callDocRef, 'offerCandidates');

    //         const pc = new RTCPeerConnection(servers);

    //         pc.onicecandidate = (event) => {
    //             event.candidate && addDoc(answerCandidatesRef, event.candidate.toJSON());
    //         };

    //         const callData = (await getDoc(callDocRef)).data();

    //         const offerDescription = callData.offer;
    //         await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    //         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //         setLocalStream(stream);
    //         webcamVideoRef.current.srcObject = stream;
    //         stream.getTracks().forEach((track) => {
    //             pc.addTrack(track, stream);
    //         });

    //         const answerDescription = await pc.createAnswer();
    //         await pc.setLocalDescription(answerDescription);

    //         const answer = {
    //             type: answerDescription.type,
    //             sdp: answerDescription.sdp,
    //         };

    //         await setDoc(callDocRef, { answer });

    //         onSnapshot(offerCandidatesRef, (snapshot) => {
    //             snapshot.docChanges().forEach((change) => {
    //                 if (change.type === 'added') {
    //                     const data = change.doc.data();
    //                     pc.addIceCandidate(new RTCIceCandidate(data));
    //                 }
    //             });
    //         });


    //         pc.ontrack = (event) => {
    //             event.streams[0].getTracks().forEach((track) => {
    //                 if (remoteStream) {
    //                     remoteStream.addTrack(track);
    //                 } else {
    //                     const newRemoteStream = new MediaStream();
    //                     newRemoteStream.addTrack(track);
    //                     setRemoteStream(newRemoteStream);
    //                     remoteVideoRef.current.srcObject = newRemoteStream;
    //                 }
    //             });
    //         };

    //         // Disable answer button after answering the call
    //         const hangupButton = document.getElementById('hangupButton');
    //         if (hangupButton) {
    //             hangupButton.disabled = false;
    //         }
    //     } catch (error) {
    //         console.error('Error answering call:', error);
    //     }
    // };

    const handleAnswerButton = async () => {
        try {
            const callId = document.getElementById('callInput').value;
            const callDocRef = doc(db, 'calls', callId);
            const answerCandidatesRef = collection(callDocRef, 'answerCandidates');
            const offerCandidatesRef = collection(callDocRef, 'offerCandidates');

            const pc = peerConnectionSaveRef.current; // Access saved peer connection instance

            pc.onicecandidate = (event) => {
                event.candidate && addDoc(answerCandidatesRef, event.candidate.toJSON());
            };

            const callData = (await getDoc(callDocRef)).data();

            const offerDescription = callData.offer;
            await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            webcamVideoRef.current.srcObject = stream;
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);

            const answer = {
                type: answerDescription.type,
                sdp: answerDescription.sdp,
            };

            await setDoc(callDocRef, { answer });

            onSnapshot(offerCandidatesRef, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        pc.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });


            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    if (remoteStream) {
                        remoteStream.addTrack(track);
                    } else {
                        const newRemoteStream = new MediaStream();
                        newRemoteStream.addTrack(track);
                        setRemoteStream(newRemoteStream);
                        remoteVideoRef.current.srcObject = newRemoteStream;
                    }
                });
            };

            // Disable answer button after answering the call
            const hangupButton = document.getElementById('hangupButton');
            if (hangupButton) {
                hangupButton.disabled = false;
            }
        } catch (error) {
            console.error('Error answering call:', error);
        }
    };

    useEffect(() => {
        if (remoteVideoRef.current.srcObject) {
            setShowRemoteVideo(true);
        } else {
            setShowRemoteVideo(false);
        }
    }, [remoteVideoRef.current]);


    return (
        <div>
            <div className='Video'>
                <video id="webcamVideo" className='video-canvas' ref={webcamVideoRef} autoPlay muted playsInline />
                <video id="remoteVideo" className={`${showRemoteVideo ? "remoteVideo" : "video-canvas  ms-3"} `} ref={remoteVideoRef} autoPlay playsInline />

            </div>

            <button className='btn btn-info' onClick={handleStartWebcam}>Start WebCam</button>

            <h2>Create a new Call</h2>
            <button className='btn btn-info' onClick={callButtonHandler}>Call</button>


            <h2>Join a Call</h2>
            <input id='callInput' />
            <button className='btn btn-info' onClick={handleAnswerButton} >Answer</button>

        </div>
    );
};

export default VideoCall;
