import React, { useContext, useEffect, useRef, useState } from 'react'
import "./MessageComponents.scss";
import aj from "./../../Assets/20.png";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContaxt';
import { addDoc, collection, deleteDoc, doc, documentId, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { auth, db, storage } from '../../Firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 } from 'uuid';
import { saveAs } from 'file-saver'
import "./M.scss";
import MessageBottom from './MessageBottom';
import { motion } from "framer-motion"
import { BsCameraVideo, BsCheckAll } from 'react-icons/bs';
import { BiCheckDouble } from "react-icons/bi";
import FlipMove from 'react-flip-move';
import { FaArrowLeft, FaChevronDown } from 'react-icons/fa6';
import { HiLockClosed, HiReply } from "react-icons/hi";
import { MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { OnChat, ZindexMinasOne, ZindexOne, closeChat, closegetUser, emojiFalse, imgFalse } from '../../Redux/CounterSlice';
import { BsChatHeartFill } from "react-icons/bs";
import Audio from '../Audio';
import { handleRplayData, handleRplayDataClear } from '../../Redux/Replay';
import { CgMailReply } from "react-icons/cg";
import { CiImageOn } from 'react-icons/ci';
import { IoVideocamOutline } from 'react-icons/io5';
import { IoMdMicOff } from 'react-icons/io';
import { FiCameraOff } from "react-icons/fi";
import Ring from '../Ring';

const MessageComponents = ({ userId, friendId, accepterId, getUserUid, senderDocId }) => {
    var params = userId;

    const PData = useSelector(state => state.private);
    const x = PData.some(i => i.id);

    const id = x ? null : params;

    const { currentUser } = useContext(AuthContext);
    const senderId = currentUser && currentUser.uid;
    const videoRef = useRef(null);
    const messageListRef = useRef(null);
    const messageRef = useRef(null);
    const prevScrollY = useRef(0);



    const [isScroll, setIsScroll] = useState(0);

    // const handleMouseScroll = (event) => {
    //     const deltaY = event.deltaY;
    //     setIsScroll(deltaY);

    //     if (deltaY > 0) {
    //         console.log('Scrolling down');
    //     } else if (deltaY < 0) {
    //         console.log('Scrolling up');
    //     }
    // };

    // Add event listener for mouse scroll
    // window.addEventListener('wheel', handleMouseScroll);

    const [messagesFriend, setMessagesFriend] = useState([]);
    const [loadingRight, setLoadingRight] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friendsQuery = query(
                    collection(db, `allFriends/${currentUser && currentUser.uid}/Message`),
                    orderBy('time', 'asc') // Reverse the order to show newest messages first
                );

                const unsubscribe = onSnapshot(friendsQuery, (friendsSnapshot) => {
                    const friendsData = friendsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                    // Reverse the order of messages to show newest messages first
                    setMessagesFriend(friendsData.reverse());
                    setLoadingRight(false);
                });

                // Return the unsubscribe function to stop listening to updates when the component unmounts
                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriends();
    }, [currentUser]);

    const a = messagesFriend.find(i => i.id === getUserUid)

    const [ok, setok] = useState(false);
    useEffect(() => {
        if (a && a.chatLock == false) {
            setok(true)
        } else {
            return
        }
    }, [a]);


    const [addPrivatePass, setassPrivatePass] = useState("");

    const AddPrivatePass = async () => {
        // const messageData1 = {
        //     userId: currentUser.uid,

        // };
        try {
            const messageData2 = {
                userId: user.uid,
                PrivatePass: addPrivatePass,
                chatLock: true
            };

            // const docRef1 = doc(db, `allFriends/${uid}/Message`, currentUser.uid);
            const docRef2 = doc(db, `allFriends/${currentUser.uid}/Message`, user.uid);

            const promises = [];

            // promises.push(setDoc(docRef1, messageData1, { merge: true }));
            promises.push(updateDoc(docRef2, messageData2, { merge: true }));

            await Promise.all(promises);
            setassPrivatePass("");
            handlePrivatePass();
        } catch (e) {
            console.log(e);
        }

    }

    const handleViewReplyMessage = (messageId, id) => {

        if (messageId === false) {
            return
        }

        const selectedIndex = messages.findIndex(message => message.id === messageId);
        var previousMessageId;
        if (selectedIndex >= 2 && messages[selectedIndex - 2]) {
            previousMessageId = messages[selectedIndex - 2].id;
        } else {
            previousMessageId = messageId;
        }
        const messageElement = document.getElementById(`selectedMessage${previousMessageId}`);
        const messageElementc = document.getElementById(`selectedMessage${messageId}`);

        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            messageElementc.style.background = "#128c7e"
        }

        setTimeout(() => {
            messageElementc.style.background = ""
            messageElement.style.background = "#24272e";
        }, 3000);
    };

    // 

    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [ReplayData, setReplayData] = useState("");


    const [messageInput, setMessageInput] = useState("");
    const [replyInput, setReplyInput] = useState("");
    const [selectedMessageId, setSelectedMessageId] = useState("");
    const [img, setImg] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        messageListRef.current?.scrollIntoView();
    }, [messages]);

    const gotoBottom = () => {
        messageListRef.current?.scrollIntoView();
    }

    useEffect(() => {
        const messagesRef = collection(db, 'messages');
        if (user && id) {
            const q = query(
                messagesRef,
                where('sender', 'in', [senderId, user.uid]),
                where('recipient', 'in', [senderId, user.uid]),
                orderBy('timestamp', 'asc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messages = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setMessages(messages);
            });

            return () => unsubscribe();
        }
    }, [senderId, user, id]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                // Query all documents in the "messages" collection
                const messagesCollection = collection(db, 'messages');
                const querySnapshot = await getDocs(messagesCollection);

                // Iterate through the documents and update each one to set the "sound" field to null
                querySnapshot.forEach(async (doc) => {
                    const docRef = doc.ref;
                    await updateDoc(docRef, {
                        sound: "off"
                    });
                });

                // console.log('The "sound" field in all documents of the "messages" collection has been set to null.');
            } catch (error) {
                // console.error('Error deleting "sound" field:', error);
            }
        }, 1000); // 5 seconds

        return () => clearTimeout(timer); // Clear the timeout if the component unmounts
    });


    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                // Query all documents in the specific collection
                const messageCollection = collection(db, `allFriends/${currentUser && currentUser.uid}/Message`);
                const querySnapshot = await getDocs(messageCollection);

                // Iterate through the documents and update each one to set the "sound" field to null
                querySnapshot.forEach(async (doc) => {
                    const docRef = doc.ref;
                    // console.log(docRef);
                    await updateDoc(docRef, {
                        sound: "off"
                    });
                });

                // console.log('The "sound" field in all documents of the specified collection has been set to null.');
            } catch (error) {
                console.error('Error updating "sound" field:', error);
            }
        }, 1000); // 5 seconds

        return () => clearTimeout(timer); // Clear the timeout if the component unmounts
    });


    const [historyMessage, setHistoryMessages] = useState([]);

    useEffect(() => {
        const messagesRef = collection(db, 'HistoryMessages');

        if (user && id) {
            const q = query(
                messagesRef, orderBy('timestamp', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const HistoryMessages = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setHistoryMessages(HistoryMessages);
            });

            return () => unsubscribe();
        }
    }, [senderId, user, id]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userDocRef = doc(db, 'UpdateProfile', id);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    setUser({ id: userDocSnapshot.id, ...userDocSnapshot.data() });
                } else {
                    // console.log('No such document!');
                }
            } catch (error) {
                // console.log('Error fetching user:', error);
            }
        };

        fetchUser();
    }, [id]);


    const togglePlayPause = () => {
        const video = videoRef.current;
        if (video) {
            if (isPlaying) {
                video.pause();
            } else {
                video.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const [MessagePhoto, setMessagePhoto] = useState(null);
    const [MessagePhotoid, setMessagePhotoId] = useState("");
    const [photoTime, setPhotoTime] = useState("");


    const ViewMessageImg = (id, photo, time, message) => {
        setMessagePhoto(photo);
        setMessagePhotoId(id);
        setPhotoTime(time);
    };

    // =======

    const [deleteMessagePhoto, setDeleteMessagePhoto] = useState(false);
    const [deleteMediaId, setDeleteMediaId] = useState(null);
    const DeleteMedaiOverlay = (id) => {
        setDeleteMediaId(id);
        setDeleteMessagePhoto(!deleteMessagePhoto);
    };


    const [viewMessageInput, setViewMessageInput] = useState("");
    const [viewMessageImg, setViewMessageImg] = useState(null);

    const ImageDownload = (imageurl) => {
        saveAs(imageurl, 'image.jpg')
    }

    const [viewReplyVideoUrl, setViewReplyVideoUrl] = useState(null);


    const [selectedLikeMessage, setSelectedLikeMessage] = useState(false);
    const [viewReplyImgLikeUrl, setViewReplyImgLikeUrl] = useState(null);


    const [showReplyVideoUrl, setShowReplyVideoUrl] = useState(null);
    const [showReplyVideoDiv, setReplyVideoDiv] = useState(false);
    const [showReplyVideoID, setReplyVideoId] = useState("");
    const [showReplyVideoTime, setshowReplyVideoTime] = useState(null);

    if (viewReplyImgLikeUrl != null) {
        // hideX();
        setSelectedMessageId("");
        setViewMessageInput("");
        setViewMessageImg(null);
        setViewReplyImgLikeUrl(null);
    }

    const [hoveredMessageId, setHoveredMessageId] = useState('');
    const showReplyButton = (messageId) => {
        setHoveredMessageId(messageId);
    };
    const [emojiHoveredMessageId, setEmojiHoveredMessageId] = useState('');
    const showEmojiDelteBtn = (messageId) => {
        setEmojiHoveredMessageId(messageId);
    };
    const hideEmojiDelteBtn = (messageId) => {
        setEmojiHoveredMessageId('');
    };

    const hideReplyButton = () => {
        setHoveredMessageId('');
    };


    function formatTimestamp(timestamp) {
        if (!timestamp) {
            return "Invalid timestamp"; // or handle the null case appropriately
        }

        const date = timestamp.toDate();
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return date.toLocaleString('en-US', options);
    }

    function PhotoFormatTimestamp(timestamp) {
        const date = timestamp.toDate();
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return date.toLocaleString('en-US', options);
    }


    const compressImage = async (imageFile, maxWidth) => {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const aspectRatio = img.width / img.height;
                const newWidth = Math.min(maxWidth, img.width);
                const newHeight = newWidth / aspectRatio;

                canvas.width = newWidth;
                canvas.height = newHeight;

                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                canvas.toBlob(resolve, 'image/jpeg', 0.7); // Adjust the compression quality if needed
            };

            img.onerror = reject;

            img.src = URL.createObjectURL(imageFile);
        });
    };

    const [isTyping, setIsTyping] = useState(false);


    // useEffect(() => {
    //     let typingTimer;


    //     // Event listener to detect typing
    //     function handleTyping(e) {
    //         setMessageInput(e.target.value); // Update the message input state
    //         setIsTyping(true);


    //         // Clear the timer if it's already running
    //         clearTimeout(typingTimer);

    //         // Set a timer to reset isTyping to false after 3 seconds of inactivity
    //         typingTimer = setTimeout(() => {
    //             setIsTyping(false);

    //         }, 3000); // 3 seconds (adjust as needed)
    //     }

    //     // Attach the event listener to your input field
    //     const inputField = document.getElementById('messageInput'); // Replace with your input field's id

    //     // Check if the inputField exists before adding/removing the event listener
    //     if (inputField) {
    //         inputField.addEventListener('input', handleTyping);
    //     } else {
    //         console.error("Element with ID 'messageInput' not found.");
    //     }

    //     // Clean up the event listener when the component unmounts
    //     return () => {
    //         // Check if the inputField exists before removing the event listener
    //         if (inputField) {
    //             inputField.removeEventListener('input', handleTyping);
    //         }
    //     };
    // }, []);

    useEffect(() => {
        if (user?.uid) {
            const typingRef = doc(db, 'typingStatus', user.uid);

            const unsubscribe = onSnapshot(typingRef, (doc) => {
                const data = doc.data();
                if (data && data.isTyping) {
                    setIsTyping(true);
                } else {
                    setIsTyping(false);
                }
            });

            return () => unsubscribe();
        }
    }, [user]);

    const TypingRef = collection(db, 'typingStatus');

    const [typingS, setTypingS] = useState([]);
    useEffect(() => {
        const unsub = () => {
            onSnapshot(TypingRef, (snapshot) => {
                let newbooks = []
                snapshot.docs.forEach((doc) => {
                    newbooks.push({ ...doc.data(), id: doc.id })
                });
                setTypingS(newbooks);
            })
        };
        return unsub();
    }, []);

    const [sendedMessage, setSendedMessage] = useState([]);
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friendsQuery = query(
                    collection(db, `allFriends/${currentUser && currentUser.uid}/Message`),
                    orderBy('time', 'asc')
                );

                const unsubscribe = onSnapshot(friendsQuery, (friendsSnapshot) => {
                    const friendsData = friendsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                    setSendedMessage(friendsData);
                });

                // Return the unsubscribe function to stop listening to updates when the component unmounts
                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriends();
    }, [currentUser]);




    const sendMessage = async (uid, name, recipientImg) => {
        try {
            const messagesRef = collection(db, 'messages');
            const currentUser = auth.currentUser;

            const typingRef = doc(db, 'typingStatus', currentUser && currentUser.uid);
            setDoc(typingRef, { isTyping: false });

            // Prepare the new message object
            const newMessage = {
                sender: currentUser.uid,
                senderImg: currentUser.photoURL,
                recipient: uid,
                recipientImg: recipientImg,
                sound: "on",
                timestamp: serverTimestamp(),
            };

            if (messageInput) {
                newMessage.message = messageInput;
                setMessageInput(""); // Clear the message input field
            }

            if (img) {
                if (img.type.startsWith('image/')) {
                    const compressedImgBlob = await compressImage(img, 800);

                    const storageRef = ref(storage, `messageImages/${img.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, compressedImgBlob);

                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            // console.log('Upload progress: ' + progress + '%');
                            if (progress < 100) {
                                document.getElementById("progress").style.display = "block";
                            } else {
                                setImg(null);
                                document.getElementById("progress").style.display = "none";
                            }
                        },
                        (error) => {
                            console.error('Upload error:', error);
                        },
                        async () => {
                            try {
                                const imageUrl = await getDownloadURL(storageRef);
                                newMessage.imageUrl = imageUrl;
                                await addDoc(messagesRef, newMessage);
                            } catch (error) {
                                console.error('Error uploading image:', error);
                            }
                        }
                    );
                }

                // Check the type of the selected file
                else if (img.type.startsWith('audio/')) {
                    // Create a reference to the Firebase Storage location where you want to upload the audio file
                    const storageRef = ref(storage, `audioFiles/${img.name}`);

                    // Upload the audio file
                    try {
                        const uploadTask = uploadBytesResumable(storageRef, img);

                        uploadTask.on('state_changed',
                            (snapshot) => {
                                // Handle upload progress (if needed)
                            },
                            (error) => {
                                console.error('Upload error:', error);
                                // Handle the error (e.g., display an error message)
                            },
                            async () => {
                                // Upload is complete, get the download URL
                                try {
                                    const audioUrl = await getDownloadURL(storageRef);
                                    newMessage.AudioFileUrl = audioUrl; // You can customize the field name
                                    newMessage.AudioName = img.name; // You can customize the field name
                                    await addDoc(messagesRef, newMessage);
                                    // Now you can use the audioUrl as needed, such as storing it in a message object and sending it
                                    // You can also update your Firestore database with this URL
                                } catch (error) {
                                    console.error('Error getting audio URL:', error);
                                    // Handle the error (e.g., display an error message)
                                }
                            }
                        );
                    } catch (error) {
                        console.error('Error uploading audio file:', error);
                        // Handle the error (e.g., display an error message)
                    }
                }

                else if (img.type === 'text/plain') {
                    // Handle text file upload
                    const storageRef = ref(storage, `messageFiles/${img.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, img);

                    uploadTask.on(
                        'state_changed',
                        // ... (progress and error handling code)
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            // console.log('Upload progress: ' + progress + '%');
                            if (progress < 100) {
                                document.getElementById("progress").style.display = "block";
                            } else {
                                setImg(null);
                                document.getElementById("progress").style.display = "none";
                            }
                        },
                        (error) => {
                            console.error('Upload error:', error);
                        },
                        async () => {
                            try {
                                const fileUrl = await getDownloadURL(storageRef);
                                newMessage.textFileUrl = fileUrl; // You can customize the field name
                                newMessage.txtName = img.name; // You can customize the field name
                                await addDoc(messagesRef, newMessage);
                                // console.log("txt file added successfully");
                            } catch (error) {
                                console.error('Error uploading text file:', error);
                            }
                        }
                    );
                }

                else if (img.type === 'application/pdf') {
                    // Handle PDF file upload
                    const storageRef = ref(storage, `messageFiles/${img.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, img);

                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            // console.log('Upload progress: ' + progress + '%');
                            if (progress < 100) {
                                document.getElementById("progress").style.display = "block";
                            } else {
                                setImg(null);
                                document.getElementById("progress").style.display = "none";
                            }
                        },
                        (error) => {
                            console.error('Upload error:', error);
                        },
                        async () => {
                            try {
                                const fileUrl = await getDownloadURL(storageRef);
                                newMessage.pdfUrl = fileUrl; // You can customize the field name
                                newMessage.pdfName = img.name; // You can customize the field name
                                await addDoc(messagesRef, newMessage);
                                // console.log("PDF file added successfully");
                            } catch (error) {
                                console.error('Error uploading PDF:', error);
                            }
                        }
                    );
                }

                else if (img.type === 'compressed') {
                    // Handle ZIP or RAR file upload
                    const storageRef = ref(storage, `messageFiles/${img.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, img);

                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            // console.log('Upload progress: ' + progress + '%');
                            if (progress < 100) {
                                document.getElementById("progress").style.display = "block";
                            } else {
                                setImg(null);
                                document.getElementById("progress").style.display = "none";
                            }
                        },
                        (error) => {
                            console.error('Upload error:', error);
                        },
                        async () => {
                            try {
                                const fileUrl = await getDownloadURL(storageRef);
                                newMessage.archiveUrl = fileUrl; // You can customize the field name
                                newMessage.archiveName = img.name; // Set the field for the file name
                                await addDoc(messagesRef, newMessage);
                                // console.log("zip/rar file added successfully");
                            } catch (error) {
                                console.error('Error uploading archive file:', error);
                            }
                        }
                    );
                }

                else if (img.type.startsWith('video/')) {
                    const storageRef = ref(storage, 'messageVideos/' + v4());
                    const uploadTask = uploadBytesResumable(storageRef, img);

                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = Math.round(
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                            );
                            // console.log('Upload progress:', progress);
                            setLoadingProgress(progress);
                            if (progress == 100) {
                                setImg(null);
                                setLoadingProgress(false);
                                setIsPlaying(false);
                            }
                            if (progress < 100) {
                                document.getElementById('p1').style.display = 'block';
                            } else {
                                document.getElementById('p1').style.display = 'none';
                            }
                        },
                        (error) => {
                            console.error('Error uploading video:', error);
                        },
                        async () => {
                            try {
                                const videoUrl = await getDownloadURL(storageRef);
                                newMessage.videoUrl = videoUrl;
                                await addDoc(messagesRef, newMessage);
                            } catch (error) {
                                console.error('Error uploading video:', error);
                            }
                        }
                    );
                }
            } else if (newMessage.message) {
                await addDoc(messagesRef, newMessage);
            }

            // Update sender's and recipient's friend lists

            const messageData1 = {
                userId: currentUser.uid,
                name: currentUser.displayName,
                photoUrl: currentUser.photoURL,
                status: "unseen",
                sound: "on",
                photo: "unseen",
                time: serverTimestamp(),

            };

            const messageData2 = {
                userId: uid,
                name: name,
                photoUrl: recipientImg,
                status: "unseen",
                sound: "on",
                time: serverTimestamp(),
            };

            const docRef1 = doc(db, `allFriends/${uid}/Message`, currentUser.uid);
            const docRef2 = doc(db, `allFriends/${currentUser.uid}/Message`, uid);

            const promises = [];

            promises.push(setDoc(docRef1, messageData1, { merge: true }));
            promises.push(setDoc(docRef2, messageData2, { merge: true }));

            await Promise.all(promises);

        } catch (error) {
            console.error("Error sending message:", error);
        }
        handleLatestSms(uid, name, recipientImg);
        setViewMessageInput(null);
    };

    const handleTyping = () => {
        const typingRef = doc(db, 'typingStatus', currentUser && currentUser.uid);
        setDoc(typingRef, { isTyping: true });

        setTimeout(() => {
            setDoc(typingRef, { isTyping: false });
        }, 2000); // Adjust the timeout duration as needed
    };

    // -----------------------------------------------------------
    const [AudioOptionTime, setAudioOptionTime] = useState(null);
    const AudioOption = (id) => {
        setAudioOptionTime(id);
        const x = document.getElementById(`audioId${id}`);
        if (x.style.display == "none") {
            AudioOptionCloseAll();
            x.style.display = "flex"
        } else {
            x.style.display = "none";
        }

        PdfOptionCloseAll();
    }

    const AudioOptionCloseAll = () => {
        const pdfOption = document.querySelectorAll('.audio');
        pdfOption.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }


    const [textOptionTime, setTextOptionTime] = useState(null);

    const TextOption = (id) => {
        setTextOptionTime(id);
        const pdfOption = document.getElementById(`textView${id}`);
        if (pdfOption.style.display === "none") {
            PdfOptionCloseAll();
            AudioOptionCloseAll();
            pdfOption.style.display = "flex";
        } else {
            pdfOption.style.display = "none";
        }
    }


    const [pdfOptionTime, setPdfOptionTime] = useState(null);

    const PdfOption = (id) => {
        setPdfOptionTime(id);
        const pdfOption = document.getElementById(`pdfView${id}`);
        if (pdfOption.style.display === "none") {
            PdfOptionCloseAll();
            AudioOptionCloseAll();
            pdfOption.style.display = "flex";
        } else {
            pdfOption.style.display = "none";
        }
    }

    const PdfOptionCloseAll = () => {
        const pdfOption = document.querySelectorAll('.pdfView-Option');
        pdfOption.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }

    // const handleKeyEnter = (event) => {
    //     if (event.key === "Enter") {
    //         sendMessage();
    //     }
    // };

    const handleKeyEnter = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent the default behavior of the Enter key (e.g., new line)
            if (selectedMessageId) {
                sendReply(selectedMessageId);
                setSelectedMessageId("");
                setViewMessageImg(null);
                setViewMessageInput("");

                setViewMessageImg(null);
                setMessagePhoto(null);
                setShowReplyVideoUrl(null);

            } else {
                // hideX();
                sendMessage(user.uid, user.name, user.userPhoto);
            }
        }
    };

    const [selectDelete, setselectDelete] = useState(null);
    const [SenderId, setsenderId] = useState(null);
    const [selectDeleteR, setselectDeleteR] = useState(null);
    const [select, setSelect] = useState([]);

    // useEffect(() => {
    //     console.log(select);
    // }, [select]);


    const SelectedSms = (id) => {
        setSelect(prevId => [...prevId, id])
    }
    // Multiple Delete message

    const deleteMultipleMessages = async () => {
        try {
            const batch = writeBatch(db);
            select.forEach(messageId => {
                const messageRef = doc(db, 'messages', messageId);
                batch.delete(messageRef);
            });
            await batch.commit();
            setSelect([]);
        } catch (error) {
            console.error('Error deleting messages:', error);
        }
    };

    const deleteMessage = async () => {
        setimgOptionDelte(false)
        setselectDelete(null)
        setsenderId(null)

        setselectDeleteR(null)
        setselectDeleteR(null)
        setimgOptionimgUrl(null)
        setimgOptionimgTime(null)
        setvideoOptionimgTime(null)
        setimgOptionOverlay(false)

        setselectUnsend(false)
        try {

            await updateDoc(doc(db, "messages", selectDeleteR), {
                replyId: false
            })
            const messageRef = doc(db, 'messages', selectDelete);

            await deleteDoc(messageRef);
            setselectDelete(null)
            setsenderId(null)

            setselectDeleteR(null)
        }
        catch (e) {
            console.log(e)
        }
    };



    // const deleteMessage = async (messageId) => {
    //     try {
    //         const messageRef = doc(db, 'messages', messageId);

    //         // Mark the message as deleted by the sender
    //         await updateDoc(messageRef, {
    //             isDeletedBySender: true,
    //             deletedBySender: currentUser.uid
    //         });
    //         setselectDelete(null)
    //         setselectUnsend(false)

    //         console.log("Message deleted successfully!");
    //     } catch (error) {
    //         console.error("Error deleting message:", error);
    //     }
    // };


    const deleteForMe = async (messageId) => {

        setimgOptionDelte(false)
        setselectDelete(null)
        setsenderId(null)

        setselectDeleteR(null)
        setimgOptionimgUrl(null)
        setimgOptionimgTime(null)
        setvideoOptionimgTime(null)
        setimgOptionOverlay(false)


        setselectUnsend(false)
        try {
            await updateDoc(doc(db, "messages", selectDeleteR), {
                replyId: false
            })
            const messageRef = doc(db, 'messages', selectDelete);

            // Mark the message as deleted by the sender
            await updateDoc(messageRef, {
                isDeletedBySender: true,
                deletedBySender: currentUser.uid
            });

            setselectDelete(null)
            setsenderId(null)

            setselectDeleteR(null)

            // console.log("Message deleted successfully!");
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const deleteFromMessageList = async () => {
        const CurrentFriendRef = collection(db, `allFriends/${currentUser && currentUser.uid}/Message`);
        const Query = query(CurrentFriendRef, where('userId', '==', user && user.uid));
        // console.log(user);
        // console.log(userId);
        // console.log(user.uid);
        // console.log(currentUser.uid);
        try {
            const querySnapshot = await getDocs(Query);

            querySnapshot.forEach(async (doc) => {
                // console.log('Found user ID:', doc.data().userId);

                try {
                    await deleteDoc(doc.ref); // Use doc.ref to get the document reference
                    // console.log('Current User Message Deleted.');
                } catch (deleteError) {
                    console.error('Error deleting friend:', deleteError);
                }
                if (querySnapshot.size === 0) {
                    // console.log('Friend not found');
                }

            });
        } catch (error) {
            console.error('Error getting documents:', error);
        }

        // ==========================================================

        const friendsRef = collection(db, `allFriends/${user && user.uid}/Message`);
        const friendsQuery = query(friendsRef, where('userId', '==', currentUser.uid));

        try {
            const querySnapshot = await getDocs(friendsQuery);

            querySnapshot.forEach(async (doc) => {
                // console.log('Found user ID:', doc.data().userId);

                try {
                    await deleteDoc(doc.ref); // Use doc.ref to get the document reference
                    // console.log('User Message Deleted.');
                } catch (deleteError) {
                    console.error('Error deleting friend:', deleteError);
                }
                if (querySnapshot.size === 0) {
                    // console.log('Friend not found');
                }

            });
        } catch (error) {
            console.error('Error getting documents:', error);
        }
    };

    const deleteMessagesForUser = async (userId) => {
        try {
            const messagesRef = collection(db, 'messages');
            const userMessagesQuery = query(messagesRef,
                where('sender', 'in', [currentUser.uid, user.uid]),
                where('recipient', 'in', [currentUser.uid, user.uid]));
            const userMessagesSnapshot = await getDocs(userMessagesQuery);

            const batch = writeBatch(db);

            userMessagesSnapshot.forEach((messageDoc) => {
                batch.delete(messageDoc.ref);
            });

            await batch.commit();
            // console.log("User's messages deleted successfully!");
        } catch (error) {
            console.error("Error deleting user's messages:", error);
        }
    };

    const deleteMessagesForCurrentUser = async (userId) => {
        try {
            const messagesRef = collection(db, 'messages');
            const userMessagesQuery = query(
                messagesRef,
                where('sender', 'in', [currentUser.uid, user.uid]),
                where('recipient', 'in', [currentUser.uid, user.uid])
            );
            const userMessagesSnapshot = await getDocs(userMessagesQuery);

            const batch = writeBatch(db);

            userMessagesSnapshot.forEach((messageDoc) => {
                const messageRef = doc(db, 'messages', messageDoc.id);
                batch.update(messageRef, {
                    isDeletedBySender: true,
                    deletedBySender: currentUser.uid
                });
            });

            await batch.commit();
            // console.log("User's messages marked as deleted by sender!");
        } catch (error) {
            // console.error("Error marking user's messages as deleted by sender:", error);
        }
    };


    const [showMessageOption, setShowMessageOption] = useState(false);
    const HandleShowMessageOption = () => {
        setShowMessageOption(!showMessageOption);
    }

    const [areYouSure, setAreYouSure] = useState(false);
    const HandleAreyouSure = () => {
        setAreYouSure(!areYouSure);
    }
    const [areYouSureForCurrentUser, setAreYouSureForCurrentUser] = useState(false);
    const HandleAreyouSureForCurrentUser = () => {
        setAreYouSureForCurrentUser(!areYouSureForCurrentUser);
    }



    // Usage example:
    // Call this function when you want to delete all messages for a specific user
    // deleteMessagesForUser(userId);


    // Render the UI component

    const sendReply = async (messageId, uid, name, recipientImg) => {
        const selectedMessage = messages.find((message) => message.id === messageId);
        setMessageInput("");
        // setViewMessageImg(null);
        setViewMessageInput(null);
        setViewReplyImgUrl(null);
        setViewReplyVideoUrl(null);


        const messagesRef = collection(db, 'messages');
        if (selectedMessage && selectedMessage.sender) {
            let replyContent = `Reply: ${selectedMessage.message || ""}`;

            if (selectedMessage.imageUrl) {
                replyContent = `Reply to: ${selectedMessage.imageUrl}`;
            }

            if (selectedMessage.videoUrl) {
                replyContent = `Reply to video: ${selectedMessage.videoUrl}`;
            }

            // Create a new document using `addDoc` function
            const newMessage = {
                sender: currentUser.uid, // Set the sender's ID
                recipient: selectedMessage.sender, // Set the recipient's ID
                message: messageInput, // Set the message content
                sound: "on",
                timestamp: serverTimestamp(), // Set the timestamp (server-side)
                reply: replyContent,
            };


            const docRef = await addDoc(messagesRef, newMessage);

            const messageIdNew = docRef.id;

            await updateDoc(doc(db, "messages", messageId), {
                senderReplayedId: messageIdNew
            })


            const messageData1 = {
                userId: currentUser.uid,
                name: currentUser.displayName,
                photoUrl: currentUser.photoURL,
                status: "unseen",
                time: serverTimestamp(),

            };

            const messageData2 = {
                userId: uid,
                name: name,
                photoUrl: recipientImg,
                status: "unseen",
                time: serverTimestamp(),
            };

            const docRef1 = doc(db, `allFriends/${uid}/Message`, currentUser.uid);
            const docRef2 = doc(db, `allFriends/${currentUser.uid}/Message`, uid);

            const promises = [];

            promises.push(setDoc(docRef1, messageData1, { merge: true }));
            promises.push(setDoc(docRef2, messageData2, { merge: true }));

            await Promise.all(promises);

        }

        setSelectedMessageId("");

    };

    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


    // const handleMessageEmoji = () => {
    //     setMessageEmoji(!messageEmoji);
    // }

    const handleSendHistorayMessageEmoji = async (uid, recipientImg, emojiState) => {
        // handleMessageEmoji();
        if (senderId) {
            const messagesRef = collection(db, 'messages');
            const HistoryMessagesRef = collection(db, 'HistoryMessages');

            await addDoc(messagesRef, {
                sender: currentUser.uid, // Set the sender's ID
                senderImg: currentUser.photoURL,

                recipient: uid, // Set the recipient's ID
                recipientImg: recipientImg,
                imageUrlLike: emojiState,
                sound: "on",
                timestamp: serverTimestamp(), // Set the timestamp (server-side)
            });
        }
        const messageData1 = {
            userId: currentUser.uid,
            photoUrl: currentUser.photoURL,
            status: "unseen",
            sound: "on",
            time: serverTimestamp(),

        };

        const messageData2 = {
            userId: uid,
            photoUrl: recipientImg,
            status: "unseen",
            sound: "on",
            time: serverTimestamp(),
        };

        const docRef1 = doc(db, `allFriends/${uid}/Message`, currentUser.uid);
        const docRef2 = doc(db, `allFriends/${currentUser.uid}/Message`, uid);

        const promises = [];

        promises.push(setDoc(docRef1, messageData1, { merge: true }));
        promises.push(setDoc(docRef2, messageData2, { merge: true }));

        await Promise.all(promises);

    }

    const handleSendMessageEmoji = async (uid, recipientImg, emojiState) => {
        // handleMessageEmoji();
        if (senderId) {
            const messagesRef = collection(db, 'messages');
            const HistoryMessagesRef = collection(db, 'HistoryMessages');

            await addDoc(HistoryMessagesRef, {
                sender: currentUser.uid, // Set the sender's ID
                senderImg: currentUser.photoURL,
                sound: "on",
                recipient: uid, // Set the recipient's ID
                recipientImg: recipientImg,
                imageUrlLike: emojiState,
                timestamp: serverTimestamp(),
            })

            await addDoc(messagesRef, {
                sender: currentUser.uid, // Set the sender's ID
                senderImg: currentUser.photoURL,
                sound: "on",
                recipient: uid, // Set the recipient's ID
                recipientImg: recipientImg,
                imageUrlLike: emojiState,

                timestamp: serverTimestamp(), // Set the timestamp (server-side)
            });

            const messageData1 = {
                userId: currentUser.uid,
                photoUrl: currentUser.photoURL,
                status: "unseen",
                sound: "on",
                time: serverTimestamp(),

            };

            const messageData2 = {
                userId: uid,
                photoUrl: recipientImg,
                status: "unseen",
                sound: "on",
                time: serverTimestamp(),
            };

            const docRef1 = doc(db, `allFriends/${uid}/Message`, currentUser.uid);
            const docRef2 = doc(db, `allFriends/${currentUser.uid}/Message`, uid);

            const promises = [];

            promises.push(setDoc(docRef1, messageData1, { merge: true }));
            promises.push(setDoc(docRef2, messageData2, { merge: true }));

            await Promise.all(promises);
        }

    }


    const SendLike = async (uid, name, recipientImg) => {
        if (senderId) {
            const messagesRef = collection(db, 'messages');
            const content = replyInput || messageInput;
            // Create a new document using `addDoc` function
            await addDoc(messagesRef, {
                sender: currentUser.uid, // Set the sender's ID
                senderImg: currentUser.photoURL,
                sound: "on",
                recipient: uid, // Set the recipient's ID
                recipientImg: recipientImg,
                imageUrlLike: "https://i.ibb.co/zJfrRMv/Thumbs-Up.png",
                // imageUrlLike: "https://cdn3d.iconscout.com/3d/premium/thumb/like-hand-gesture-6580722-5526788.png?f=webp",
                timestamp: serverTimestamp(), // Set the timestamp (server-side)
            });

            const messageData1 = {
                userId: currentUser.uid,
                name: currentUser.displayName,
                photoUrl: currentUser.photoURL,
                status: "unseen",
                sound: "on",
                time: serverTimestamp(),
            };

            const messageData2 = {
                userId: uid,
                name: name,
                photoUrl: recipientImg,
                status: "unseen",
                sound: "on",
                time: serverTimestamp(),
            };

            const docRef1 = doc(db, `allFriends/${uid}/Message`, currentUser.uid);
            const docRef2 = doc(db, `allFriends/${currentUser.uid}/Message`, uid);

            const promises = [];

            promises.push(setDoc(docRef1, messageData1, { merge: true }));
            promises.push(setDoc(docRef2, messageData2, { merge: true }));

            await Promise.all(promises);
        }
    }

    // e.preventDefault();

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent the default behavior of the Enter key (e.g., new line)
            if (selectedMessageId) {
                sendReply(selectedMessageId);
                setSelectedMessageId("");
                setViewMessageImg(null);
                setViewMessageInput("");

                setViewMessageImg(null);
                setMessagePhoto(null);
                setShowReplyVideoUrl(null);

            } else {
                // hideX();
                sendMessage(user.uid, user.name, user.userPhoto);
            }
        }
    };


    // message video functions @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2

    const [viewVideoDiv, setViewVideoDiv] = useState(false);
    const [videoId, SetVideoId] = useState(null);
    const [videoUrl, SetVideoUrl] = useState(null);
    const [messageVideoTime, setMessageVideoTime] = useState("");
    const [loadingProgress, setLoadingProgress] = useState("");

    function MessageVideoFormatTimestamp(timestamp) {
        const date = messageVideoTime.toDate();
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return date.toLocaleString('en-US', options);
    }

    const handleVewVideo = (id, url, time) => {
        setViewVideoDiv(!viewVideoDiv);
        SetVideoId(id);
        SetVideoUrl(url);
        setMessageVideoTime(time);
    };

    const DeleteVideo = async (id) => {
        setDeleteMessagePhoto(false);
        setViewVideoDiv(false);
        setReplyVideoDiv(false);
        // console.log(id);
        const messageRef = doc(db, 'messages', deleteMediaId);
        await deleteDoc(messageRef);
        setDeleteMediaId(null);
    };

    // END @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    const HandleShowReplyVdieo = (id, url, time) => {
        // console.log(id);
        setReplyVideoId(id);
        setReplyVideoDiv(!showReplyVideoDiv)
        setShowReplyVideoUrl(url);
        setReplyImgTime(time);
    }

    const Delete_Photo_Video = async () => {

        setDeleteMessagePhoto(false);
        setReplyVideoDiv(false); //view video div none
        setShowReplyVideoUrl(null); //set video url none


        setViewReplyImgState(false); // view image div none
        setMessagePhoto(null); // set photo none

        const messageRef = doc(db, 'messages', deleteMediaId);
        await deleteDoc(messageRef);

        setDeleteMediaId(null);
    };

    const [viewReplyImgState, setViewReplyImgState] = useState(false);
    const [replyImgid, setReplyImgid] = useState("");
    const [viewReplyImgUrl, setViewReplyImgUrl] = useState(null);
    const [replyImgTime, setReplyImgTime] = useState("");
    const [selectUnsend, setselectUnsend] = useState(false);
    const [chatOpton, setchatOpton] = useState(false);
    const [profile, setprofile] = useState(false);
    const [privatePass, setprivatePass] = useState(false);
    const [chatOptonDelete, setchatOptonDelete] = useState("");

    const [imgOptionOverlay, setimgOptionOverlay] = useState(false);
    const [imgOptionimgUrl, setimgOptionimgUrl] = useState(null);
    const [imgOptionimgTime, setimgOptionimgTime] = useState(null);
    const [videoOptionimgTime, setvideoOptionimgTime] = useState(null);
    const [imgOptionDelte, setimgOptionDelte] = useState(false);


    function ReplyPhotoFormatTimestamp(timestamp) {
        const date = replyImgTime.toDate();
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return date.toLocaleString('en-US', options);
    }


    const handleLatestSms = async (uid, name, photo) => {
        const latestRef = collection(db, "NewMessage");

        const data = {
            reciverUid: uid,
            reciverName: name,
            reciverPhoto: photo,
            senderUid: currentUser.uid,
            senderName: currentUser.displayName,
            timestamp: serverTimestamp(),
        };
        await addDoc(latestRef, data);

    };

    const HandleSmsSeen = (id) => {
        const smsRef = doc(db, `allFriends/${id}/Message/${currentUser.uid}`); // Include the document ID here
        const smsRefReciver = doc(db, `allFriends/${currentUser.uid}/Message/${id}`);
        updateDoc(smsRef, {
            status: "seen",
        })
        updateDoc(smsRefReciver, {
            photo: "seen",
        })
            .then(() => {
                // console.log("Message marked as seen successfully.");
            })
            .catch((error) => {
                console.error("Error marking message as seen:", error);
            });
    };


    const newMess = messages.filter(item => currentUser && currentUser.uid === item.sender && item.isDeletedBySender)
    const MessCurret = messages.filter(item => item.id)
    const unsameIndices = MessCurret.filter((element, index) => newMess.indexOf(element) === -1);

    const latestMessage = unsameIndices.length > 0 ? unsameIndices[unsameIndices.length - 1] : null;

    useEffect(() => {
        const sub = async () => {
            const CurrentFriendRef = collection(db, `allFriends/${currentUser && currentUser.uid}/Friends`);
            const CurrentFriendRefTwo = collection(db, `allFriends/${user && user.uid}/Friends`);

            try {
                const CurrentUserDoc = await getDoc(doc(CurrentFriendRef, friendId));
                const CurrentUserDocTwo = await getDoc(doc(CurrentFriendRefTwo, accepterId));
                if (CurrentUserDoc.exists() && CurrentUserDocTwo.exists()) {
                    await updateDoc(doc(CurrentFriendRef, friendId), {
                        latestSms: latestMessage.message,
                    });
                    await updateDoc(doc(CurrentFriendRefTwo, accepterId), {
                        latestSms: latestMessage.message,
                    });
                }
            } catch (e) {
                // console.log(e)
            }
        };

        // Return a cleanup function
        return () => {
            sub(); // This will run the cleanup logic when the effect is cleaned up
        };
    }, [latestMessage]);



    const [api, setApiData] = useState([]);
    useEffect(() => {
        const colRef = collection(db, "users");
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const newApi = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setApiData(newApi);
        });

        return unsubscribe;
    }, []);

    // const userFilter = api.filter((u) => u.uid === user && user.uid)
    // // const userEmail = userFilter.map((i) => i && i.email);
    // console.log(userFilter)

    // Unfollow Friend

    const UnfollowFriend = async () => {

        deleteMessagesForUser();

        const CurrentFriendRef = collection(db, `allFriends/${currentUser && currentUser.uid}/Friends`);
        // console.log(user);
        // console.log(userId);
        // console.log(user.uid);
        try {
            const CurrentUserDoc = await getDoc(doc(CurrentFriendRef, friendId));

            if (CurrentUserDoc.exists()) {
                await deleteDoc(doc(CurrentFriendRef, friendId));
                // console.log('Friend deleted successfully');
            } else {
                // console.log('Friend not found');
            }

        } catch (error) {
            console.error('Error deleting friend:', error);
        }

        const RequestRef = doc(db, 'NewFriendRequests', currentUser && currentUser.uid + user && user.uid);

        try {
            await deleteDoc(RequestRef);
            // console.log('Friend Request deleted successfully');
        } catch (error) {
            console.error('Error deleting friend request:', error);
        }

        // ==========================================================

        const friendsRef = collection(db, `allFriends/${user && user.uid}/Friends`);
        const friendsQuery = query(friendsRef, where('userId', '==', currentUser && currentUser.uid));

        const smsRef = doc(db, `allFriends/${id}/Message/${currentUser && currentUser.uid}`);
        const smsRefPhoto = doc(db, `allFriends/${user && user.uid}/Message/${id}`);

        await deleteDoc(smsRef)
        await deleteDoc(smsRefPhoto)

        try {

            const querySnapshot = await getDocs(friendsQuery);

            querySnapshot.forEach(async (doc) => {
                // console.log('Found user ID:', doc.data().friendId);

                try {
                    await deleteDoc(doc.ref); // Use doc.ref to get the document reference
                    // console.log('Friend deleted successfully');
                } catch (deleteError) {
                    console.error('Error deleting friend:', deleteError);
                }
                if (querySnapshot.size === 0) {
                    // console.log('Friend not found');
                }

            });
        } catch (error) {
            console.error('Error getting documents:', error);
        }
    };

    // =======
    const chatStatus = useSelector(state => state.counter.chatStatas)
    const [UserEmpty, setUserEmpty] = useState(true);
    useEffect(() => {
        if (id) {
            setUserEmpty(true);
        }
    }, [id]);

    // const PData = useSelector(state => state.private);
    // const x = PData.some(i=>i.id);
    // useEffect(() => {
    //     console.log("PData: ", x)
    //     if (x) {
    //         console.log("PData: ", x)
    //         // setUser(false);
    //     }
    // }, [x]);




    const handalDataEmty = () => {
        setUserEmpty(!UserEmpty);
    }

    const dispatch = useDispatch();

    const zindexStatas = useSelector(state => state.counter.smollSize);
    useEffect(() => {
        const x = document.getElementById("message-main");
        if (x) {
            x.style.zIndex = zindexStatas
        }
    }, [zindexStatas]);

    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const userRef = collection(db, 'OnlyOnline');
        const unsub = () => {
            onSnapshot(userRef, (snapshot) => {
                let newbooks = []
                snapshot.docs.forEach((doc) => {
                    newbooks.push({ ...doc.data(), id: doc.id })
                });
                setOnlineUsers(newbooks);
            })
        };
        return unsub();
    }, []);

    // Replay Section Satrt ==================================

    const [ReplayMessageText, setReplayMessageText] = useState("");
    const [ReplayMessageId, setReplayMessageId] = useState("");

    const ReplayDataFunction = (id, message, image, video, emoji, name) => {
        dispatch(handleRplayData({
            id,
            message,
            photoUrl: image,
            videoUrl: video,
            emojiUrl: emoji,
            name: name,
        }))
    }
    const ReplayDataClearFunction = () => {
        dispatch(handleRplayDataClear())
    }


    const [Ringing, setRinging] = useState(false);
    const [VideoCallerId, setVideoCallerId] = useState("");



    useEffect(() => {

        setTimeout(async () => {

            try {
                const friendDocRef = doc(db, `allFriends/${currentUser && currentUser.uid}/Friends/${friendId}`);
                const CurrentFriendRefTwo = doc(db, `allFriends/${user && user.uid}/Friends/${accepterId}`);
                const colRef = doc(db, 'users', VideoCallerId);

                const friendDocSnapshot = await getDoc(friendDocRef);
                const CurrentUserDocTwo = await getDoc(CurrentFriendRefTwo);
                if (CurrentUserDocTwo.exists() && friendDocSnapshot.exists()) {
                    await updateDoc(friendDocRef, {
                        callStatus: "End",
                        timestamp: serverTimestamp()
                    });
                    await updateDoc(CurrentFriendRefTwo, {
                        callStatus: "End",
                        timestamp: serverTimestamp()
                    });

                    await updateDoc(colRef, {
                        VideoCall: "End",
                        VideoTime: serverTimestamp()
                    });
                    // console.log("Call End.");
                    setVideoCallerId("")
                    setRinging(false);
                } else {
                    // console.log("Friend document does not exist.");
                }
            } catch (error) {
                console.error("Error updating call status:", error);
            }
        }, 12000);

    }, [Ringing, friendId, accepterId, VideoCallerId]);


    // End
    const [checkFile, setcheckFile] = useState(null);

    const [callMic, setcallMic] = useState(false);
    const [callCamera, setcallCamera] = useState(false);


    if (UserEmpty && chatStatus ? !user : user) {
        return <>
            <div className='skeleton-center bg-light_0 dark:bg-dark'>
                <img style={{ width: "50px" }} src="https://i.ibb.co/0YmB22g/Grinning-Face-with-Big-Eyes.png" alt="" />
                <div className='skeleton-center-div mt-4' >
                    Select a friend to chat messaging
                </div>
            </div >
        </>;
    }

    const handleImgOptionOverlay = (id, url, time, check) => {
        setcheckFile(check);
        setselectDelete(id);
        setimgOptionimgUrl(url);
        setimgOptionimgTime(time);
        setimgOptionOverlay(!imgOptionOverlay)
    }



    const handleImgOptionOverlayVideo = (id, url, time, check) => {
        setcheckFile(check);
        setselectDelete(id);
        setimgOptionimgUrl(url);
        // setvideoOptionimgTime(time);
        setimgOptionOverlay(!imgOptionOverlay)
    }

    const handleSetimgOptionDelte = () => {
        setimgOptionDelte(!imgOptionDelte)
    }

    const messageOption = (id) => {
        let x = document.getElementById(`message-option-overlay${id}`);
        let y = document.getElementById(`message-time-div${id}`);

        if (x.style.display && y.style.display == "none") {
            messageOptionClose();
            x.style.display = "block"
            y.style.display = "block"
        }
        else {
            x.style.display = "none"
            y.style.display = "none"
        }
        if (x.style.display && y.style.display == "block") {
        }
    }

    const messageOptionClose = () => {
        ReplayDataClearFunction();
        let y = document.querySelectorAll(`.message-time-div`);
        let x = document.querySelectorAll(`.message-option-overlay`);
        let xx = document.querySelectorAll(`.message-option-overlay-reciver`);
        x.forEach(e => {
            e.style.display = "none"
        })
        y.forEach(e => {
            e.style.display = "none"
        })
        xx.forEach(e => {
            e.style.display = "none"
        })
    }
    const messageOptionCloseTwo = () => {
        let y = document.querySelectorAll(`.message-time-div`);
        let x = document.querySelectorAll(`.message-option-overlay`);
        let xx = document.querySelectorAll(`.message-option-overlay-reciver`);
        x.forEach(e => {
            e.style.display = "none"
        })
        y.forEach(e => {
            e.style.display = "none"
        })
        xx.forEach(e => {
            e.style.display = "none"
        })
    }


    const handleUnsend = (id, R, senderId) => {
        setselectDelete(id)
        setsenderId(senderId)
        setselectDeleteR(R)
        setselectUnsend(!selectUnsend)
    }

    const handleChatOption = () => {
        setchatOpton(!chatOpton)
    }
    const handleProfile = () => {
        setprofile(!profile)
    }
    const handlePrivatePass = () => {
        setprivatePass(!privatePass)
    }
    const handleChatOptionDelete = (name) => {
        setchatOptonDelete(name)
    }

    function PostTimeAgoComponent({ timestamp }) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
        const diffInDays = Math.floor(diffInSeconds / 86400);

        if (diffInDays === 0) {
            // Message sent today
            const messageTime = new Date(timestamp);
            const hours = messageTime.getHours();
            const minutes = messageTime.getMinutes();
            const amOrPm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 === 0 ? 12 : hours % 12;
            return `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${amOrPm}`;
        } else if (diffInDays === 1) {
            // Message sent yesterday
            return "Yesterday";
        } else if (diffInDays < 7) {
            // Within the last week, show day name
            const date = new Date(timestamp);
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayIndex = date.getDay();
            return dayNames[dayIndex];
        } else if (diffInDays < 30) {
            // If less than 30 days (approximately 1 month), show days ago
            return `${diffInDays}d ago`;
        } else {
            // Show month and day
            const date = new Date(timestamp);
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            const day = date.getDate();
            const monthIndex = date.getMonth();
            return `${monthNames[monthIndex]} ${day}`;
        }
    }

    const handleEmojiClose = () => {
        dispatch(emojiFalse())
    }

    const handleImgClose = () => {
        dispatch(imgFalse())
    }

    const handleZMinOne = () => {
        dispatch(ZindexMinasOne())
    }

    const handleChatClose = () => {
        dispatch(closeChat())
    }
    const handleClosegetData = () => {
        dispatch(closegetUser())
    }

    const handleChatlock = async () => {
        try {
            // Query to find documents where PrivatePass exists
            const querySnapshot = await getDocs(collection(db, `allFriends/${currentUser && currentUser.uid}/Message`));

            // Array to store promises for batch update
            const promises = [];

            // Iterate through each document in the query snapshot
            querySnapshot.forEach((doc) => {
                // Check if the document data contains PrivatePass field
                if (doc.data().PrivatePass) {
                    // Update the document with chatLock: true
                    const updatePromise = updateDoc(doc.ref, { chatLock: true }, { merge: true });
                    promises.push(updatePromise);
                }
            });

            // Execute all update promises concurrently
            await Promise.all(promises);
        } catch (e) {
            console.log(e);
        }
    }

    const handleisCallEnd = async () => {
        const callRef = doc(db, "allFriends", currentUser && currentUser.uid, "Friends");
        try {
            await setDoc(callRef, {
                callStatus: "Colling",
                remoteUid: user.uid,
                offerUid: currentUser && currentUser.uid,
                timestamp: serverTimestamp()
            });

        } catch (e) {
            console.log(e)
        }
    }


    const handleCallEnd = async () => {

        try {
            const friendDocRef = doc(db, `allFriends/${currentUser && currentUser.uid}/Friends/${friendId}`);
            const CurrentFriendRefTwo = doc(db, `allFriends/${user && user.uid}/Friends/${accepterId}`);


            const colRef = collection(db, 'users');
            const q = query(colRef, where('uid', '==', user.uid));

            getDocs(q)
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const docRef = doc.ref;
                        // Access the document data here
                        console.log('Document data:', doc.data());
                        // If you need the document ID
                        console.log('Document ID:', doc.id);
                        // Assuming setVideoCallerId and updateDoc are defined elsewhere
                        setVideoCallerId(doc.id);

                        // Update the document with VideoCall: "Ringing" and VideoTime: serverTimestamp()
                        updateDoc(docRef, {  // Here colRef is a collection reference
                            VideoCall: "End",
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

            const friendDocSnapshot = await getDoc(friendDocRef);
            const CurrentUserDocTwo = await getDoc(CurrentFriendRefTwo);

            setRinging(true)
            if (CurrentUserDocTwo.exists()) {

                await updateDoc(friendDocRef, {
                    callStatus: "End",
                    timestamp: serverTimestamp()
                });
                await updateDoc(CurrentFriendRefTwo, {
                    callStatus: "End",
                    timestamp: serverTimestamp()
                });
                // console.log("Call status updated successfully.");
            } else {
                console.log("Friend document does not exist.");
            }
        } catch (error) {
            console.error("Error updating call status:", error);
        }
    };
    const handleCall = async () => {

        try {
            const friendDocRef = doc(db, `allFriends/${currentUser && currentUser.uid}/Friends/${friendId}`);
            const CurrentFriendRefTwo = doc(db, `allFriends/${user && user.uid}/Friends/${accepterId}`);


            const colRef = collection(db, 'users');
            const q = query(colRef, where('uid', '==', user.uid));

            getDocs(q)
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const docRef = doc.ref;
                        // Access the document data here
                        console.log('Document data:', doc.data());
                        // If you need the document ID
                        console.log('Document ID:', doc.id);
                        // Assuming setVideoCallerId and updateDoc are defined elsewhere
                        setVideoCallerId(doc.id);

                        // Update the document with VideoCall: "Ringing" and VideoTime: serverTimestamp()
                        updateDoc(docRef, {  // Here colRef is a collection reference
                            VideoCall: "Ringing",
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

            const friendDocSnapshot = await getDoc(friendDocRef);
            const CurrentUserDocTwo = await getDoc(CurrentFriendRefTwo);

            setRinging(true)
            if (CurrentUserDocTwo.exists()) {

                await updateDoc(friendDocRef, {
                    callStatus: "Calling",
                    timestamp: serverTimestamp()
                });
                await updateDoc(CurrentFriendRefTwo, {
                    callStatus: "Calling",
                    timestamp: serverTimestamp()
                });
                // console.log("Call status updated successfully.");
            } else {
                console.log("Friend document does not exist.");
            }
        } catch (error) {
            console.error("Error updating call status:", error);
        }
    };


    // const handleCall = async () => {
    //     const CurrentFriendRef = collection(db, `allFriends/${currentUser && currentUser.uid}/Friends/ ${friendId}`);
    //     // const CurrentFriendRefTwo = collection(db, `allFriends/${user && user.uid}/Friends`);

    //     try {
    //         const CurrentUserDoc = await getDoc(doc(CurrentFriendRef, id));
    //         // const CurrentUserDocTwo = await getDoc(doc(CurrentFriendRefTwo, accepterId));
    //         await updateDoc(doc(CurrentFriendRef,), {
    //             callStatus: "Colling",
    //             timestamp: serverTimestamp()
    //         });
    //         // await updateDoc(doc(CurrentFriendRefTwo, accepterId), {
    //         //     callStatus: "Colling",
    //         //     timestamp: serverTimestamp()
    //         // });
    //     } catch (e) {
    //         console.log(e)
    //     }
    // }



    const handleCallMic = () => {
        setcallMic(!callMic)
    }
    const handleCallCamera = () => {
        setcallCamera(!callCamera)
    }

    const isCall = api.find((i) => i.uid === user.uid);
    const isCallUid = isCall ? isCall.VideoCall : null;


    return (
        <div className='message-main' id="message-main" >

            {isCallUid == "Ringing" ?
                <div className="Call-Div">
                    <Ring />
                    <div className="Caller-inner-div">
                        <img src={user.userPhoto} alt="" className='caller-img' />
                        <span className='ringin-text'>Ringing...</span>
                        <div className="call-btn-div">
                            <FiCameraOff className={`${callCamera ? "call-item-icons-selected" : "call-item-icons"}`} onClick={handleCallCamera} />
                            <IoMdMicOff className={`${callMic ? "call-item-icons-selected" : "call-item-icons"}`} onClick={handleCallMic} />
                            <div className="end-call-btn" onClick={handleCallEnd}>End</div>
                        </div>
                    </div>
                </div>
                :
                null
            }

            {
                !x &&
                <div className="message-top-bar" onClick={() => { messageOptionClose(); handleEmojiClose(); handleImgClose(); }}>
                    <div style={{ display: "flex", alignItems: "center" }} onClick={() => setchatOpton(false)}>
                        <FaArrowLeft style={{ cursor: "pointer", }} onClick={() => { handleZMinOne(); handleChatClose(); handleClosegetData(); handleChatlock(); }} />
                        <img src={user && user.userPhoto} className='message-top-img' alt="" />
                        <div style={{ textTransform: "capitalize", fontWeight: "400", fontSize: "15px", lineHeight: "17px" }} >
                            {user && user.name}

                            {typingS.map((item) => {
                                if (user.uid === item.id) {
                                    return (
                                        <div key={item.id}>
                                            {item.isTyping === true ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.6 }}
                                                    className="typing-text">
                                                    Typing . . .
                                                </motion.div>
                                            ) :

                                                <div className="Online-status">
                                                    {onlineUsers.map((o) => {
                                                        if (o.id === user.uid) {
                                                            return (
                                                                <div>
                                                                    {o.status == "Online" ? o.status : null}
                                                                </div>
                                                            )
                                                        }
                                                    })}
                                                </div>
                                            }
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </div>


                    <div className='message-top-option-div'>
                        <BsCameraVideo className='message-top-camera-icon' onClick={handleCall} />
                        <div className='message-top-option-btn' onClick={handleChatOption} >
                            <PiDotsThreeOutlineVerticalFill />
                        </div>
                    </div>

                    {/* overlay */}
                    {chatOpton &&
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="chat-option-container" >
                            <div className='chat-option-item' onClick={() => { handleChatOption(); handleProfile() }} >
                                View Profile
                            </div>
                            <div className='chat-option-item' onClick={() => { handlePrivatePass(); }}>
                                <HiLockClosed className='lock-icon' /> Private Chat
                            </div>
                            <div className='chat-option-item' onClick={() => { handleChatOptionDelete("clear"); handleChatOption(); }}>
                                Clear Chat
                            </div>
                            <div className='chat-option-item' onClick={() => { handleChatOptionDelete("delete"); handleChatOption(); }}>
                                Delete Chat
                            </div>
                            <div className='chat-option-item' onClick={handleChatOption}>
                                Cancle
                            </div>
                        </motion.div>
                    }
                </div>
            }

            {
                x &&
                <div div className='skeleton-center bg-light_0 dark:bg-dark'>
                    <div className="skeleton-center-img"></div>
                    <HiLockClosed className='skelton-lock' />
                    <div className='skeleton-center-div mt-4' >
                        Messege Locked
                    </div>
                </div >
            }

            {
                !x &&
                <div className="message-center-container" onClick={() => { handleEmojiClose(); handleImgClose(); setchatOpton(false) }} >
                    {/* OnWheel Scroll Btn */}
                    {/* <div className="message-center-container" onClick={() => { handleEmojiClose(); handleImgClose(); setchatOpton(false) }} onWheel={handleMouseScroll}> */}

                    {/* overlay Satert-------------------- */}

                    {/* Scrol Btn */}
                    {/* <motion.div
                    animate={{ y: isScroll == -100 ? 0 : 100 }}
                    transition={{ duration: 0.5 }}
                    className="scroll-Btn" onClick={gotoBottom}>
                    <FaChevronDown />
                </motion.div> */}

                    {/* message img overlay */}
                    {imgOptionOverlay &&
                        <div className="img-option-container">

                            <FaArrowLeft onClick={() => { handleImgOptionOverlay(); setimgOptionDelte(false); }} className='img-option-close-btn' />

                            <div className="img-option-image-div" onClick={() => setimgOptionDelte(false)}>
                                {!checkFile ?
                                    <video ref={videoRef} className="device-option-video" onClick={togglePlayPause}>
                                        <source src={imgOptionimgUrl} />
                                    </video>
                                    :

                                    <img src={imgOptionimgUrl} alt="" className='img-option-image' />
                                }

                            </div>

                            <div className="img-option-div">
                                <CgMailReply className='img-option-reply-btn' style={{ fontSize: "24px" }} onClick={() => {
                                    setimgOptionDelte(false);
                                    handleImgOptionOverlay();
                                    ReplayDataFunction(
                                        selectDelete,
                                        "",
                                        checkFile ? imgOptionimgUrl : "",
                                        !checkFile ? imgOptionimgUrl : "",
                                        "",
                                        user.name
                                    )
                                }} />
                                <MdDelete className="img-option-delete-btn" onClick={handleSetimgOptionDelte} />
                                <div className='img-option-time'>
                                    {!checkFile ?
                                        <>{PhotoFormatTimestamp(videoOptionimgTime)}</>
                                        :
                                        <>{PhotoFormatTimestamp(imgOptionimgTime)}</>
                                    }
                                </div>
                            </div>
                            {imgOptionDelte &&
                                <motion.div
                                    initial={{ y: 50 }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                    className="img-option-delete-container">
                                    <div onClick={() => { deleteForMe(); }}>
                                        Delete For me
                                    </div>

                                    <div onClick={() => { deleteMessage(); }}>
                                        Delete For every one
                                    </div>
                                </motion.div>
                            }

                        </div>
                    }

                    {/* Profile overlay */}
                    {profile &&
                        <div className="profile-container">
                            <motion.div
                                initial={{ opacity: 0 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                animate={{ opacity: 1 }}
                                className="profile-div" >
                                <img src={user && user.userPhoto} alt="" className='profile-img' />
                                <div className='profile-name'>{user && user.name}</div>
                                <div className="profile-email">
                                    {api.map((i) => {
                                        if (i.uid === user.uid) {

                                            return (
                                                <>
                                                    {i.email}
                                                </>
                                            )
                                        }
                                    })}
                                </div>
                                <div style={{ marginTop: "0.5rem", fontSize: "18px", fontWeight: 500 }}>
                                    {api.map((i) => {
                                        if (i.uid === user.uid) {

                                            return (
                                                <>
                                                    {i.mobile}
                                                </>
                                            )
                                        }
                                    })}
                                </div>

                                <div className="profile-unfollow-btn-div">
                                    <div className="profile-unfollow-btn" onClick={() => { UnfollowFriend(); handleProfile(); deleteMessagesForUser(); handalDataEmty(); }}>
                                        Unfollow
                                    </div>
                                    <div className="profile-close-btn" onClick={handleProfile}>
                                        Close
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    }

                    {/* end */}

                    {privatePass &&
                        <div className="profile-container">
                            <motion.div
                                initial={{ opacity: 0 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                animate={{ opacity: 1 }}
                                className="profile-div" >
                                <img src={user && user.userPhoto} alt="" className='profile-img' />
                                <div className='profile-name'>{user && user.name}</div>
                                <input type="password" value={addPrivatePass} placeholder='Set private password' onChange={(e) => setassPrivatePass(e.target.value)} className='private-pass-input' />
                                {/* <div className='private-pass'>Save</div> */}

                                <div className="profile-unfollow-btn-div">
                                    <div className="profile-unfollow-btn" onClick={AddPrivatePass}>
                                        Save
                                    </div>
                                    <div className="profile-close-btn" onClick={handlePrivatePass}>
                                        Close
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    }

                    {/* Chat option Overlay */}

                    {chatOptonDelete == "clear" ?
                        <div className="Chat-delete-option-div">
                            <motion.div
                                initial={{ scale: 1.7, opacity: 0 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="chat-option-Message-div" >
                                This chat will be empty

                                <div style={{ display: "flex", alignItems: "center", marginTop: "2rem" }}>
                                    <div className="chat-option-btn" style={{ background: "none", border: '1px solid #545d6d' }}
                                        onClick={() => { handleChatOptionDelete(""); }}
                                    >
                                        Cancel
                                    </div>
                                    <div className="chat-option-btn" onClick={deleteMessagesForCurrentUser}>
                                        Clear Chat
                                    </div>
                                </div>

                            </motion.div>
                        </div>
                        :
                        null
                    }

                    {chatOptonDelete == "delete" ?
                        <div className="Chat-delete-option-div">
                            <motion.div
                                initial={{ scale: 1.7, opacity: 0 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="chat-option-Message-div" >
                                Delete This Chat?

                                <div style={{ display: "flex", alignItems: "center", marginTop: "2rem" }}>
                                    <div className="chat-option-btn" style={{ background: "none", border: '1px solid #545d6d' }}
                                        onClick={() => { handleChatOptionDelete(""); }}
                                    >
                                        Cancel
                                    </div>
                                    <div className="chat-option-btn" onClick={() => { deleteMessagesForUser(); handleChatOptionDelete(); }}>
                                        Delete Chat
                                    </div>
                                </div>

                            </motion.div>
                        </div>
                        :
                        null
                    }

                    {/* Delete Message overlay */}

                    {
                        selectUnsend &&
                        <div className="delete-Message-div">
                            <motion.div
                                initial={{ scale: 1.7, opacity: 0 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="delete-Message-div-inner" >

                                {SenderId === user.uid ? null :
                                    <div style={{ cursor: "pointer", borderRadius: "20px", padding: "5px 15px" }} onClick={deleteMessage}>
                                        Delete for everyone
                                    </div>
                                }
                                <div style={{ margin: "1.5rem 0", cursor: "pointer", borderRadius: "20px", padding: "5px 15px" }} onClick={deleteForMe}>
                                    Delete for me
                                </div>
                                <div style={{ cursor: "pointer", borderRadius: "20px", padding: "5px 15px" }} onClick={handleUnsend}>
                                    Cancle
                                </div>
                            </motion.div>
                        </div>
                    }

                    {/* overlay End */}

                    <div className="message-item-div" onClick={() => { setchatOpton(false); }}>
                        {unsameIndices.map((message, index) => {

                            const isSender = message.sender === currentUser.uid;
                            const isDeletedBySender = message.isDeletedBySender || false;
                            const deletedBySenderUid = message.deletedBySender === currentUser.uid;
                            if (
                                (message.sender === currentUser.uid && message.recipient === user.uid) ||
                                (message.sender === user.uid && message.recipient === currentUser.uid)
                            ) {
                                const isSender = message.sender === currentUser.uid;
                                const messageClass = isSender ? 'sender' : 'user';
                                const isRecipient = message.recipient === user.uid;
                                const hasImage = !!message.imageUrl; // Check if message has an imageUrl

                                const hasTxt = !!message.textFileUrl; // Check if message has an imageUrl
                                const hasPdf = !!message.pdfUrl; // Check if message has an imageUrl
                                const hasAudio = !!message.AudioFileUrl; // Check if message has an imageUrl

                                const hasVideo = !!message.videoUrl; // Check if message has an imageUrl
                                const hasImageLike = !!message.imageUrlLike; // Check if message has an imageUrl.



                                return (

                                    <div key={message.id}
                                        className={`message-item ${messageClass}`} >

                                        <div className={`message-bubble ${isSender ? 'message-sender' : 'message-recipient '} ${hasImage || hasVideo || hasImageLike ? 'has-image' : ''}`}

                                        >

                                            {/* {!isSender && <div> <img className="message-img" src={user.userPhoto} alt="Sender" />
                                        {message.sound === "on" ? {HandleSmsSeen(user.uid)}</> : ""}
                                        </div>} */}

                                            {!isSender && <div> <img className="message-img" src={user.userPhoto} alt="Sender" />
                                                {message.sound === "on" ? <><Audio /> {HandleSmsSeen(user.uid)}</> : ""}
                                            </div>}

                                            <div>

                                                {
                                                    message.reply ?
                                                        (<div className={`message-content ${!isSender ? 'reciverClass' : "senderClass"} `} style={{ padding: "4px 8px" }}
                                                            onClick={() => { messageOption(message.id); }}>
                                                            {message.reply && (
                                                                <div className="message-reply">
                                                                    {(message.reply.startsWith("Reply to: ") || message.reply.includes("Reply to video: ")) ? (
                                                                        <>
                                                                            <div style={{
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                width: "100%", borderRadius: "0.5rem"
                                                                            }}
                                                                                onClick={() => HandleShowReplyVdieo(message.id, message.reply, message.timestamp)}
                                                                            >
                                                                                {message.reply.includes("Reply to video: ") && (

                                                                                    <div className="">
                                                                                        <div className='replay-name'>{user.name}</div>
                                                                                        <div className='d-flex align-items-center'>
                                                                                            <div className='d-flex align-items-center'>
                                                                                                <IoVideocamOutline style={{ fontSize: "18px" }} /> <span className='mx-2 me-5'>Video</span>
                                                                                            </div>
                                                                                            <video ref={videoRef} className="replied-video">
                                                                                                <source src={message.reply.split("Reply to video: ")[1]} />
                                                                                            </video>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {message.reply.includes("Reply to: ") && (
                                                                                    <div className='replay-message-img-div' >
                                                                                        <div className='replay-name'>{user.name}</div>

                                                                                        <div className='d-flex align-items-center'>
                                                                                            <div className='d-flex align-items-center'>
                                                                                                <CiImageOn style={{ fontSize: "18px" }} /> <span className='mx-2 me-5'>Image</span>
                                                                                            </div>
                                                                                            <img src={message.reply.split("Reply to: ")[1]}
                                                                                                alt="Replied Image"
                                                                                                className="replied-image"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className='replay-message-div'>
                                                                            {!isSender ?
                                                                                <div className='replay-name'>You</div>
                                                                                :
                                                                                <div className='replay-name'>{user.name}</div>
                                                                            }
                                                                            <div className='replay-message' >{message.reply.replace('Reply:', '')}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {message.message && <div
                                                                onClick={() => {
                                                                    SelectedSms(message.id);
                                                                    showReplyButton(message.id);

                                                                }}
                                                                onMouseLeave={hideReplyButton} id={`selectedMessage${message.id}`} >

                                                                <div>
                                                                    {isSender &&
                                                                        <div className='message-option-overlay' style={{ display: "none" }} id={`message-option-overlay${message.id}`}>
                                                                            {message.reply &&
                                                                                <div style={{ fontSize: "13px", marginBottom: "15px", cursor: "pointer" }}
                                                                                    onClick={() => { handleViewReplyMessage(message.replyId, message.id); }}>
                                                                                    {/* setReplayData(message.replyId); */}
                                                                                    view message
                                                                                </div>
                                                                            }

                                                                            <div style={{ fontSize: "13px", cursor: "pointer", fontWeight: "500" }}
                                                                                onClick={() => handleUnsend(message.id, message.senderReplayedId, message.sender)}
                                                                            >
                                                                                Delete
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>

                                                                {!isSender &&
                                                                    <div className='message-option-overlay-reciver' style={{ display: "none" }} id={`message-option-overlay${message.id}`}>
                                                                        <div style={{ fontSize: "13px", marginBottom: "15px", cursor: "pointer" }}
                                                                            onClick={() => {
                                                                                ReplayDataFunction(
                                                                                    message.id,
                                                                                    message.message,
                                                                                    message.imageUrl,
                                                                                    message.videoUrl,
                                                                                    message.imageUrlLike,
                                                                                    user.name
                                                                                )
                                                                            }}
                                                                        >
                                                                            Replay
                                                                        </div>
                                                                        <div style={{ fontSize: "13px", cursor: "pointer", fontWeight: "500" }}
                                                                            onClick={() => handleUnsend(message.id, message.senderReplayedId, message.sender)}
                                                                        >
                                                                            Delete
                                                                        </div>
                                                                    </div>
                                                                }

                                                                {message.message}

                                                                <div className="message-time-div" id={`message-time-div${message && message.id}`} style={{ display: "none" }}>
                                                                    {formatTimestamp(message && message.timestamp)}
                                                                </div>
                                                            </div>}
                                                        </div>)

                                                        :

                                                        (<>
                                                            {message.message && <div
                                                                className={`message-content  ${!isSender ? 'reciverClass' : "senderClass"} `}
                                                                onClick={() => {
                                                                    SelectedSms(message.id);
                                                                    showReplyButton(message.id);
                                                                    messageOption(message.id);

                                                                }}
                                                                onMouseLeave={hideReplyButton} id={`selectedMessage${message.id}`} >

                                                                <div>
                                                                    {isSender &&
                                                                        <div className='message-option-overlay' style={{ display: "none" }} id={`message-option-overlay${message.id}`}>
                                                                            {/* <div style={{ fontSize: "13px", marginBottom: "15px", cursor: "pointer" }}>
                                                                            Replay
                                                                        </div> */}
                                                                            <div style={{ fontSize: "13px", cursor: "pointer", fontWeight: "500" }}
                                                                                onClick={() => handleUnsend(message.id, message.senderReplayedId, message.sender)}
                                                                            >
                                                                                Delete
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>

                                                                {!isSender &&
                                                                    <div className='message-option-overlay-reciver' style={{ display: "none" }} id={`message-option-overlay${message.id}`}>
                                                                        <div style={{ fontSize: "13px", marginBottom: "15px", cursor: "pointer" }}
                                                                            onClick={() => {
                                                                                ReplayDataFunction(
                                                                                    message.id,
                                                                                    message.message,
                                                                                    message.imageUrl,
                                                                                    message.videoUrl,
                                                                                    message.imageUrlLike,
                                                                                    user.name
                                                                                )
                                                                            }}
                                                                        >
                                                                            Replay
                                                                        </div>
                                                                        <div style={{ fontSize: "13px", cursor: "pointer", fontWeight: "500" }}
                                                                            onClick={() => handleUnsend(message.id, message.senderReplayedId, message.sender)}
                                                                        >
                                                                            Delete
                                                                        </div>
                                                                    </div>
                                                                }

                                                                {message.message}

                                                                <div className="message-time-div" id={`message-time-div${message && message.id}`} style={{ display: "none" }}>
                                                                    {formatTimestamp(message && message.timestamp)}
                                                                </div>
                                                            </div>}
                                                        </>)

                                                }


                                                {hasImage &&
                                                    <div
                                                        onClick={() => {
                                                            handleImgOptionOverlay(message.id, message.imageUrl, message && message.timestamp, true);
                                                            messageOptionClose();
                                                        }}
                                                        className='messageImg-div'
                                                    >
                                                        <img onClick={() => ViewMessageImg(message.id, message.imageUrl, message && message.timestamp, message)} src={message && message.imageUrl}
                                                            className='messageImg' alt="Message" />

                                                        <div className="messageImg-time">
                                                            <PostTimeAgoComponent timestamp={message.timestamp && message.timestamp.toDate()} />
                                                        </div>
                                                    </div>
                                                }

                                                {hasVideo &&
                                                    <div onClick={() => {
                                                        setvideoOptionimgTime(message.timestamp)
                                                        handleImgOptionOverlayVideo(message.id, message.videoUrl, message.timestamp, false);
                                                        messageOptionClose();
                                                    }}>
                                                        <div className="message-video-container" >

                                                            <video ref={videoRef} className="messageVideo">
                                                                <source src={message.videoUrl} />
                                                            </video>
                                                            <div className="message-play-button">
                                                                <div className="message-play-btn-div">
                                                                    <i className="bi bi-play-fill message-play-btn"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }

                                            </div>

                                        </div>
                                    </div >
                                );
                            }

                            return null;
                        })}

                        {sendedMessage.map((item) => {
                            if (item.userId === user.uid) {
                                return (
                                    <div key={item.id}>

                                        <div className='message-seen-div text-lightPostIcon dark:text-darkPostIcon'>

                                            <div className="seen-check-mark">

                                                {item.status == "seen" ?
                                                    <BiCheckDouble style={{ fontSize: "20px", color: "#40FF00" }} />
                                                    :
                                                    null
                                                }

                                            </div>

                                        </div>
                                    </div>
                                )
                            }
                        })}

                        <div ref={messageListRef} />
                    </div>

                </div >
            }

            {
                !x &&
                <MessageBottom user={user}
                    ReplayDataText={ReplayMessageText}
                    ReplayDataId={ReplayMessageId}
                    params={params} messageOptionClose={messageOptionCloseTwo}
                    setchatOpton={setchatOpton} />
            }

        </div >
    )
}

export default MessageComponents