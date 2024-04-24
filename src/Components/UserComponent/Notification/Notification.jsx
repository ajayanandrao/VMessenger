import React, { useContext, useEffect, useState } from 'react'
import "./Notification.scss"
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../Firebase';
import { AuthContext } from '../../../AuthContaxt';
import { IoClose } from "react-icons/io5";
import { IoPersonRemove } from "react-icons/io5";
import { IoPersonAdd } from "react-icons/io5";
import { motion } from "framer-motion";
import { SlOptionsVertical } from "react-icons/sl";
import { AiOutlineLike } from 'react-icons/ai';

const Notification = ({ notiOverlay, notiOverlayTrue, SearchNotifi }) => {
    const { currentUser } = useContext(AuthContext);

    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        const colRef = collection(db, 'NewFriendRequests');
        const userlist = () => {
            onSnapshot(query(colRef, orderBy('timestamp', 'desc')), (snapshot) => {
                let newbooks = [];
                snapshot.docs.forEach((doc) => {
                    newbooks.push({ ...doc.data(), id: doc.id });
                });
                setFriendRequests(newbooks);
            });
        };
        return userlist();
    }, []);


    const DeleteRequest = async (id, senderId, receiverUid) => {
        const RequestRef = doc(db, 'NewFriendRequests', id);
        await deleteDoc(RequestRef);

        const notificationRef = collection(db, 'Notification');
        const notificationQuerySnapshot = await getDocs(notificationRef);
        notificationQuerySnapshot.forEach(async (notificationDoc) => {
            const notificationData = notificationDoc.data();
            if (notificationData.senderId === senderId &&
                notificationData.postSenderUid === receiverUid
                && (notificationData.status === 'pending' || notificationData.status === 'accepted')) {
                await deleteDoc(notificationDoc.ref);
                // console.log('Notification deleted.');
            }
        });


    };

    // const handlAcceptFriendRequest = async() => {
    //     try {
    //         await addDoc(collection(db, `allFriends/${receiverUid}/Friends`), {
    //             userId: senderId,
    //             displayName: senderName,
    //             photoUrl: senderPhotoUrl,
    //             status: 'accepted',
    //             uid: senderId,
    //             requestID: mainid,
    //             id:
    //         });
    //     } catch (e) {

    //     }
    // }


    const acceptFriendRequest = async (requestId, senderId, receiverUid,
        senderName, senderPhotoUrl, receiverName, receiverPhotoUrl, mainid) => {
        try {
            const requestRef = doc(db, 'NewFriendRequests', requestId);
            const requestDoc = await getDoc(requestRef);

            if (requestDoc.exists()) {
                await updateDoc(requestRef, { status: 'accepted' });
                // console.log('Friend request accepted!');

                // Add sender to receiver's friends list
                // await addDoc(collection(db, `allFriends/${receiverUid}/Friends`), {
                //     userId: senderId,
                //     displayName: senderName,
                //     photoUrl: senderPhotoUrl,
                //     status: 'accepted',
                //     uid: senderId,
                //     requestID: mainid,
                // });

                const docRef = await addDoc(collection(db, `allFriends/${receiverUid}/Friends`), {
                    userId: senderId,
                    displayName: senderName,
                    photoUrl: senderPhotoUrl,
                    status: 'accepted',
                    uid: senderId,
                    requestID: mainid
                });


                // Add receiver to sender's friends list
                const docRefTwo = await addDoc(collection(db, `allFriends/${senderId}/Friends`), {
                    userId: receiverUid,
                    displayName: receiverName,
                    photoUrl: receiverPhotoUrl,
                    status: 'accepted',
                    uid: receiverUid,
                    requestID: mainid,
                });


                const docId = docRef.id;
                const docIdTwo = docRefTwo.id;

                await updateDoc(doc(db, `allFriends/${receiverUid}/Friends`, docId), {
                    senderDocId: docIdTwo,
                    accepterDocId: docId
                });


                await updateDoc(doc(db, `allFriends/${senderId}/Friends`, docIdTwo), {
                    accepterDocId: docId,
                    senderDocId: docIdTwo,
                });

                const notificationRef = collection(db, 'Notification');
                const notificationQuerySnapshot = await getDocs(notificationRef);

                notificationQuerySnapshot.forEach(async (notificationDoc) => {
                    const notificationData = notificationDoc.data();
                    if (notificationData.senderId === senderId &&
                        notificationData.postSenderUid === receiverUid
                        && (notificationData.status === 'pending' || notificationData.status === 'accepted')) {
                        await deleteDoc(notificationDoc.ref);
                        // console.log('Notification deleted.');
                    }
                });

                // 

                const messageData1 = {
                    userId: currentUser.uid,
                    name: currentUser.displayName,
                    photoUrl: currentUser.photoURL,
                    status: "unseen",
                    sound: "on",
                    photo: "seen",
                    time: serverTimestamp(),

                };

                const messageData2 = {
                    userId: senderId,
                    name: senderName,
                    photoUrl: senderPhotoUrl,
                    status: "unseen",
                    sound: "on",
                    photo: "seen",
                    time: serverTimestamp(),
                };

                const docRef1 = doc(db, `allFriends/${senderId}/Message`, currentUser.uid);
                const docRef2 = doc(db, `allFriends/${currentUser && currentUser.uid}/Message`, senderId);

                const promises = [];

                promises.push(setDoc(docRef1, messageData1, { merge: true }));
                promises.push(setDoc(docRef2, messageData2, { merge: true }));

                await Promise.all(promises);


            } else {
                console.error('Friend request not found.');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }

        const RequestRef = doc(db, 'NewFriendRequests', requestId);
        await deleteDoc(RequestRef);

    };

    const NotificationOvarlay = (id) => {
        notiOverlay(true)
        const x = document.getElementById(`notification-card-overlay${id}`);
        if (x.style.display == "none") {
            NotificationOvarlayClose();
            x.style.display = "flex"
        } else {
            x.style.display = "none"
        }
    }

    useEffect(() => {
        if (!notiOverlayTrue) {
            NotificationOvarlayClose()
        }
    }, [notiOverlayTrue]);

    const NotificationOvarlayClose = () => {
        const x = document.querySelectorAll(".notification-card-overlay");
        x.forEach(e => {
            e.style.display = "none";
        })
    }

    return (
        <div>
            {friendRequests.map((item) => {
                if (item.receiverUid === currentUser.uid && item.status !== 'accepted') {
                    return (
                        <div key={item.id}>
                            <motion.div

                                key={item.id} className='user-div notification-card'>

                                {/* overlay */}

                                <div
                                    className="notification-card-overlay" style={{ display: "none" }} id={`notification-card-overlay${item.id}`}>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div>
                                            <img className="notifiaction-img" src={item.senderPhotoUrl} alt="" />
                                        </div>

                                        <div className='follow-back-btn' onClick={() => acceptFriendRequest
                                            (item.id, item.senderId, item.receiverUid, item.senderName, item.senderPhotoUrl,
                                                item.receiverName, item.receiverPhotoUrl, item.mainid)}>
                                            <div><IoPersonAdd style={{ fontSize: "23px", color: "white" }} /></div>
                                            <span className='ms-2' style={{ fontSize: "15px" }}>Follow Back</span>
                                        </div>
                                    </div>

                                    <div className='follow-back-btn' onClick={() => DeleteRequest(item.id, item.senderId, item.receiverUid)}>
                                        <IoPersonRemove style={{ fontSize: "23px", marginRight: "0.5rem", opacity: "50%" }} />
                                    </div>

                                    {/* <div className='follow-back-btn'>
                                        </div>
                                        <div className='follow-back-btn' onClick={() => DeleteRequest(item.id, item.senderId, item.receiverUid)}>
                                            Remove
                                        </div> */}
                                </div>

                                {/* end */}
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div> <img src={item.senderPhotoUrl} className='user-img' alt="" /></div>
                                    <dir className="user-name">
                                        {item.senderName}

                                        <div style={{ fontSize: "12px", marginTop: "5px", color: "#f1f1f1" }}>
                                            starting following you <AiOutlineLike style={{ fontSize: "15px" }} />
                                        </div>
                                    </dir>
                                </div>

                                <div className='noti-option-btn' onClick={() => NotificationOvarlay(item.id)}>
                                    <SlOptionsVertical />
                                </div>
                            </motion.div>
                        </div>
                    );
                } else {
                    return null;
                }
            })
            }
        </div >
    )
}

export default Notification