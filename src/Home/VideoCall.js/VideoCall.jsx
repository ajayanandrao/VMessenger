import React, { useContext, useEffect, useRef, useState } from 'react';
import { collection, doc, addDoc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../Firebase';
import "./VideoCall.scss";
import { v4 } from 'uuid';
import callEnd from "./../../Assets/callend.png";
import call from "./../../Assets/call.png";
import { AuthContext } from '../../AuthContaxt';
import { useSelector } from 'react-redux';

const VideoCall = ({ isCallCamera, cameraOn, handleCallEnd, handleCallConnect, isCallUid, callerId, isCameraClose, userData }) => {

    const webcamVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callId, setCallId] = useState('');
    const peerConnectionSaveRef = useRef(null);
    const [startV, setStartV] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const [showRemoteVideo, setShowRemoteVideo] = useState(false);

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    // const handleStartWebcam = async () => {
    //     try {
    //         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //         setLocalStream(stream);
    //         webcamVideoRef.current.srcObject = stream;
    //         const pc = new RTCPeerConnection(servers);
    //         peerConnectionSaveRef.current = pc; // Save peer connection instance
    //         stream.getTracks().forEach((track) => {
    //             pc.addTrack(track, stream);
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

    //         // Rest of the logic...
    //     } catch (error) {
    //         console.error('Error accessing webcam:', error);
    //     }
    // };

    useEffect(() => {
        if (cameraOn) {
            setStartV(true);
        }
    }, [cameraOn]);

    const [isvideoCallActive, setsetisvideoCallActive] = useState(false);

    useEffect(() => {
        if (startV) {
            const playVideoFromCamera = async () => {
                try {
                    if (startV) {
                        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                        webcamVideoRef.current.srcObject = localStream;

                        const pc = new RTCPeerConnection(servers);
                        peerConnectionSaveRef.current = pc; // Save peer connection instance
                        localStream.getTracks().forEach((track) => {
                            pc.addTrack(track, localStream);
                        });

                        callButtonHandler();

                        pc.ontrack = (event) => {
                            event.streams[0].getTracks().forEach((track) => {
                                if (remoteStream) {
                                    remoteStream.addTrack(track);
                                } else {
                                    const newRemoteStream = new MediaStream();
                                    newRemoteStream.addTrack(track);
                                    setRemoteStream(newRemoteStream);
                                    remoteVideoRef.current.srcObject = newRemoteStream;
                                    setsetisvideoCallActive(true);
                                }
                            });
                        };

                    } else {
                        webcamVideoRef.current.srcObject = null;
                        setsetisvideoCallActive(false)
                    }
                } catch (error) {
                    console.error('Error accessing camera:', error);
                }
            };

            playVideoFromCamera();

            return () => {
                if (webcamVideoRef.current.srcObject) {
                    webcamVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
                    webcamVideoRef.current.srcObject = null;
                }
            };
        }
    }, [startV]);

    const handleEndCall = () => {
        setsetisvideoCallActive(false)
        setStartV(false);
        handleCallEnd();
    };

    useEffect(() => {
        if (isCameraClose == "off") {
            setsetisvideoCallActive(false)
            setStartV(false);
            handleEndCall();
        }
    }, [isCameraClose]);

    const videoId = useSelector(state => state.counter.callerId);

    const callButtonHandler = async () => {
        try {
            const callDocRef = doc(db, 'calls', videoId);
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


    const handleStartWebcam = async (id) => {
        console.log(id)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            webcamVideoRef.current.srcObject = stream;
            const pc = new RTCPeerConnection(servers);
            peerConnectionSaveRef.current = pc; // Save peer connection instance
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            handleAnswerButton(id);
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

    const handleAnswerButton = async (id) => {
        try {

            const callDocRef = doc(db, 'calls', id);

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



    return (
        <div>
            <div className='Video'>
                <video id="webcamVideo" className='video-canvas-webCam' ref={webcamVideoRef} autoPlay muted playsInline />
                <video id="remoteVideo" className="video-canvas-remote" ref={remoteVideoRef} autoPlay playsInline />
            </div>

            {/* {!isvideoCallActive &&
                <div className="caller-user-dev">
                    <div>  <img src={userData && userData.userPhoto} className='caller-photo' alt="" /></div>
                    <span className='ringin-call mt-4'>Ringing..</span>
                </div>
            } */}

            {/* <button className='btn btn-info' onClick={() => setStartV(true)}>Start WebCam</button> */}
            <img src={callEnd} onClick={handleEndCall} className='end-call-btn-close' alt="" />


            {callerId && callerId !== currentUser && currentUser.uid &&
                <img src={call} onClick={() => handleStartWebcam(callerId)} className='end-call-btn-ans' alt="" />
            }
        </div >
    );
};

export default VideoCall;
