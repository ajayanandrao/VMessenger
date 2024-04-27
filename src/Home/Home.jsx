import React, { useContext, useEffect, useRef, useState } from 'react'
import "./Home.scss";
import UserComponent from '../Components/UserComponent/UserComponent';
import MessageComponents from '../Components/MessageComponents/MessageComponents';
import { FaArrowLeft } from 'react-icons/fa6';
import { VscSmiley } from 'react-icons/vsc';
import { IoCall, IoSend } from 'react-icons/io5';
import { BiSend } from 'react-icons/bi';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../Firebase';
import { AuthContext } from '../AuthContaxt';
import statusIcon from "./../Assets/status.png";
import { statusData, statusDataClear } from '../Redux/StorySlice';
import { useDispatch, useSelector } from 'react-redux';
import Status from './Status';
import StatusUser from './StatusUser';
import Audio from '../Components/Audio';
import VideoCall from './VideoCall.js/VideoCall';
import call from "./../Assets/call.png"
import callEnd from "./../Assets/callend.png"
import Wsound from '../Components/Wsound';
import { motion } from "framer-motion"
import { callerUser, callerUserEmpty } from '../Redux/CounterSlice';

const Home = () => {
    const [userData, setuserData] = useState("");
    const [friendId, setFriendId] = useState("");
    const [accept, setAcceptId] = useState("");
    const [getuser, setgetuser] = useState("");
    const [senderDocId, setsenderDocId] = useState();

    const { currentUser } = useContext(AuthContext);
    const statusOverlay = useSelector(state => state.status);
    const statusOverlayCurrent = useSelector(state => state.counter.status);

    const handalData = (num, id, accepterID, uid, sendDocId) => {
        setFriendId(num);
        setuserData(id);
        setAcceptId(accepterID);
        setgetuser(uid);
        setsenderDocId(sendDocId);
    }

    const handalDataEmty = (id) => {
        setuserData(id);
    }

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const PresenceRefOnline = doc(db, 'OnlyOnline', currentUser && currentUser.uid);
                setDoc(PresenceRefOnline, {
                    status: 'Online',
                    uid: currentUser.uid,
                    presenceName: currentUser.displayName,
                    email: currentUser.email,
                    photoUrl: currentUser.photoURL,
                    presenceTime: new Date(),
                    timestamp: serverTimestamp()
                });
                // Simulate a delay of 2 seconds (you can adjust the delay as needed)
                setTimeout(async () => {
                    const friendsQuery = query(
                        collection(db, `allFriends/${currentUser && currentUser.uid}/Message`),
                        orderBy('time', 'asc') // Reverse the order to show newest messages first
                    );

                    const unsubscribe = onSnapshot(friendsQuery, (friendsSnapshot) => {
                        const friendsData = friendsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                        // Reverse the order of messages to show newest messages first
                        setMessages(friendsData.reverse());
                    });

                    // Return the unsubscribe function to stop listening to updates when the component unmounts
                    return () => unsubscribe();
                }, 2000); // Delay for 2 seconds (2000 milliseconds)
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriends();
    }, [currentUser]);

    useEffect(() => {
        const handleBeforeUnload = async () => {
            // Update Firestore document when the browser is closed
            const PresenceRefOnline = doc(db, 'OnlyOnline', currentUser && currentUser.uid);

            try {
                // Delete the document from Firestore
                await updateDoc(PresenceRefOnline, {
                    status: 'Offline',
                    presenceTime: new Date(),
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.error('Error deleting PresenceRefOnline:', error);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentUser]);


    const [stories, setStories] = useState([]);

    const StoryRef = collection(db, 'stories');

    useEffect(() => {
        const unsub = () => {
            onSnapshot(StoryRef, (snapshot) => {
                let newbooks = []
                snapshot.docs.forEach((doc) => {
                    newbooks.push({ ...doc.data(), id: doc.id })
                });
                setStories(newbooks);
            })
        };
        return unsub();
    }, []);


    useEffect(() => {
        // For each fetched post, check and delete if expired
        stories.forEach((story) => {
            const now = new Date();
            const diff = now - story.timestamp.toDate();
            const hoursPassed = diff / (1000 * 60 * 60); // Calculate hours passed

            if (hoursPassed > 4) {
                handleDeletePost(story.id);
            }
        });
    }, [stories]);

    const handleDeletePost = async (storyId) => {
        try {
            const postRef = doc(db, 'stories', storyId);
            // Delete the post
            await deleteDoc(postRef);
            // Optionally, you can delete associated comments, likes, etc., if required
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };


    const [api, setApiData] = useState([]);
    useEffect(() => {
        const colRef = collection(db, 'users');
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const newApi = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setApiData(newApi);
        });

        return unsubscribe;
    }, []);



    const [callData, setcallData] = useState([]);
    useEffect(() => {
        const callref = collection(db, "UserCalls");

        const unsubscribe = onSnapshot(callref, (snapshot) => {
            const newApi = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setcallData(newApi);
        });

        return unsubscribe;


    }, []);

    const [friends, setFriends] = useState([]);

    const friendsQuery = collection(db, `allFriends/${currentUser && currentUser.uid}/Friends`);

    useEffect(() => {
        const unsub = onSnapshot(friendsQuery, (snapshot) => {
            let newFriends = [];
            snapshot.forEach((doc) => {
                newFriends.push({ ...doc.data(), id: doc.id });
            });
            setFriends(newFriends);
        });

        // Cleanup function to unsubscribe from the snapshot listener
        return () => unsub();
    }, [friendsQuery]);


    // useEffect(() => {
    //     const unsub = onSnapshot(friendsQuery, (snapshot) => {
    //         let newFriends = [];
    //         snapshot.forEach((doc) => {
    //             const friendData = doc.data();
    //             // Check if the callStatus is "Calling"
    //             if (friendData.callStatus === "Calling") {
    //                 // Update the callStatus to "End" after 2000ms
    //                 setTimeout(() => {
    //                     // Use the doc reference to update the document
    //                     updateDoc(doc.ref, { callStatus: "End",  timestamp: serverTimestamp() })
    //                         .then(() => {
    //                             console.log("Call ended for:", doc.id);
    //                         })
    //                         .catch((error) => {
    //                             console.error("Error updating document:", error);
    //                         });
    //                 }, 2000);
    //             }
    //             newFriends.push({ ...friendData, id: doc.id });
    //         });
    //         setFriends(newFriends);
    //     });

    //     // Cleanup function to unsubscribe from the snapshot listener
    //     return () => unsub();
    // }, [friendsQuery]);

    // ======================================================

    const isCall = api.find((i) => i.uid === currentUser.uid);
    const isCallId = isCall ? isCall.id : null;
    const isCallUid = isCall ? isCall.VideoCall : null;

    const isCallConnected = isCall ? isCall.VideoConnected : null;

    const callerName = isCall ? isCall.CallerName : null;
    const callerImg = isCall ? isCall.CallerImg : null;
    const callerId = isCall ? isCall.CallerId : null;
    const [VideoCallerId, setVideoCallerId] = useState("");

    const handleCallConnect = async () => {

        try {
            const colRef = collection(db, 'users');
            const q = query(colRef, where('uid', '==', currentUser && currentUser.uid));

            getDocs(q)
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const docRef = doc.ref;
                        setVideoCallerId(doc.id);

                        updateDoc(docRef, {
                            VideoConnected: "Connected",
                            VideoTime: serverTimestamp()
                        }).then(() => {
                            console.log("call Connected successfully");
                        }).catch((error) => {
                            console.error("Error updating document: ", error);
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error getting documents: ', error);
                });

        } catch (error) {
            console.error("Error updating call status:", error);
        }
    };

    const handleCallDisConnect = async () => {

        try {
            const colRef = collection(db, 'users');
            const q = query(colRef, where('uid', '==', currentUser && currentUser.uid));

            getDocs(q)
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const docRef = doc.ref;
                        setVideoCallerId(doc.id);

                        updateDoc(docRef, {
                            VideoCamera: "off",
                            VideoCall: "End",
                            VideoConnected: "disConnected",
                            VideoTime: serverTimestamp()
                        }).then(() => {
                            console.log("Document updated successfully");
                        }).catch((error) => {
                            console.error("Error updating document: ", error);
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error getting documents: ', error);
                });

        } catch (error) {
            console.error("Error updating call status:", error);
        }
    };

    const handalcallEnd = () => {

        const colRef = doc(db, 'users', isCallId);

        try {
            updateDoc(colRef, {  // Here colRef is a collection reference
                VideoCall: "End",
                VideoTime: serverTimestamp()
            }).then(() => {
                console.log("Call End");
            }).catch((error) => {
                console.error("Error updating document: ", error);
            });
        } catch (e) {
            console.log(e)
        }
    }

    const dispatch = useDispatch();

    const handleAnswerId = () => {
        handleCallConnect();
        dispatch(callerUser(callerId))
    }
    const handleAnswerIdNull = () => {
        dispatch(callerUserEmpty())
    }

    const handleCloseCamera = async () => {

        const colRef = doc(db, 'users', isCallId);
        try {
            updateDoc(colRef, {  // Here colRef is a collection reference
                VideoCamera: "off",
            }).then(() => {
            }).catch((error) => {
                console.error("Error updating document: ", error);
            });
            handleAnswerIdNull();
        } catch (e) {
            console.log(e)
        }
    };


    return (
        <div className='home-main'>

            {isCallUid == "Ringing" ?
                <motion.div
                    className='Call-Div'>
                    {/* <Wsound /> */}
                    {/* <div>
                        <img src={callerImg} alt="" className='isCall-img' />
                    </div>
                    <span className='iscall-name'>{callerName}</span>
                    <div className="call-btn-div">
                        <img src={callEnd} alt="" className='call-item-icons' onClick={handleCloseCamera} />
                        <img src={call} alt="" className='call-item-icons call' onClick={handleAnswerId} />
                    </div> */}
                    <VideoCall callerId={callerId} />
                </motion.div>
                : null
            }

            {messages.slice(0, 1).map((sms) => {

                const isSender = sms.sender === currentUser.uid;

                return (
                    <div key={sms.id}>

                        {
                            sms.photo === 'unseen' ? (
                                <div>
                                    {sms.sound === "on" ? <Audio /> : ""}
                                </div>
                            ) : null
                        }


                    </div>
                );
            })}

            {statusOverlay.map((i) => {
                if (i.overlay) {
                    return (
                        <StatusUser />
                    )
                }
            })}
            {statusOverlayCurrent &&
                <Status />
            }
            <UserComponent handalData={handalData} />
            <MessageComponents
                userId={userData} senderDocId={senderDocId}
                getUserUid={getuser} handalDataEmty={handalDataEmty}
                friendId={friendId} accepterId={accept} />



        </div >
    )
}

export default Home