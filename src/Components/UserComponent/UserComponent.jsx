import React, { useContext, useState, useEffect, useRef } from 'react'
import "./UserComponent.scss";
import { HiLockClosed, HiMenuAlt4 } from "react-icons/hi";
import { BsPeopleFill } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa6";
import users from "./../user.json"
import { motion } from "framer-motion"
import aj from "./../../Assets/20.png";
import { FaPen } from "react-icons/fa6";
import { FaCamera } from "react-icons/fa";
import { BsMoonStarsFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";

import { signOut, updateProfile } from 'firebase/auth';
import { AuthContext } from '../../AuthContaxt';
import { deleteDoc, collection, doc, serverTimestamp, updateDoc, query, orderBy, onSnapshot, where, getDocs, addDoc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db, realdb, storage } from '../../Firebase';
import { Link, useNavigate } from 'react-router-dom';
import UsersData from './Users/UsersData';
import Notification from './Notification/Notification';
import { BsCheckAll } from "react-icons/bs";
import { OnChat, ZindexMinasOne, ZindexOne, closeChat, emojiFalse, getUser, imgFalse, statusOn } from '../../Redux/CounterSlice';
import { useDispatch, useSelector } from 'react-redux';
import { BiCheckDouble } from "react-icons/bi";
import { LiaSearchSolid } from "react-icons/lia";
import { FaBell } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import FlipMove from "react-flip-move"
import { IoSearch, IoSend } from 'react-icons/io5';
import statusicon from "./../../Assets/status.png";
import { ImLink } from 'react-icons/im';
import { VscSmiley } from 'react-icons/vsc';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { statusData, statusDataClear } from '../../Redux/StorySlice';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { handlePrivaeData, handlePrivaeDataClear } from '../../Redux/PrivatePass';

const UserComponent = ({ handalData, user }) => {
    const { currentUser } = useContext(AuthContext);
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [LoadingLogout, setLoadingLogout] = useState(false);

    const [checked, setChecked] = React.useState(true);

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

    const theme = createTheme({
        palette: {
            primary: {
                main: '#128c7e',
            },
        },
    });

    const LogOut = async () => {
        setLoadingLogout(true);
        const PresenceRef = doc(db, "userPresece", currentUser && currentUser.uid);

        await updateDoc(PresenceRef, {
            status: "Offline",
        });

        const PresenceRefOnline = doc(db, "OnlyOnline", currentUser && currentUser.uid);
        await updateDoc(PresenceRefOnline, {
            status: 'Offline',
            presenceTime: new Date(),
            timestamp: serverTimestamp()
        });
        signOut(auth)
            .then(() => {
                setLoadingLogout(false);
                // Sign-out successful.
            })
            .catch((error) => {
                // An error happened.
            });

        nav("/");
    };

    const [option, setoption] = useState(true);
    const handleOption = () => {
        setoption(!option)
    }
    const [people, setpeople] = useState(true);
    const handlePeople = () => {
        setpeople(!people)
    }
    const [story, setstory] = useState(true);

    const handlestory = () => {
        setstory(!story)
    }
    const handleUserFollow = (id) => {
        const x = document.getElementById(`follow${id}`)
        if (x.innerHTML == "Follow") {
            x.innerHTML = "UnFollow"
            x.style.color = "white"
        } else {
            x.innerHTML = "Follow"
            x.style.color = "#007bff"
        }

    }

    const handleRequest = (id) => {
        const x = document.getElementById(`request${id}`)
        if (x.innerHTML == "Follow Back") {
            x.innerHTML = "Following"
            x.style.color = "#01DF3A"
        } else {
            x.innerHTML = "Follow Back"
            x.style.color = "white"
        }

    }

    const [tabs, settabs] = useState("noti");

    const handalTabs = (tabName) => {
        settabs(tabName)
    }



    const [opacity, setopacity] = useState(false);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setopacity(!opacity)
        }, 1000);

        // Clean up the timeout to avoid memory leaks
        return () => clearTimeout(timeoutId);
    }, []);

    // Friends ==================================================================

    const [messages, setMessages] = useState([]);
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
                    setMessages(friendsData.reverse());
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

    const [api, setApiData] = useState([]);
    useEffect(() => {
        const colRef = collection(db, 'users');
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const newApi = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setApiData(newApi);
        });

        return unsubscribe;
    }, []);

    const [friendsList, setFriendsList] = useState([]);

    const one = messages.filter((i) => i)
    const FilterFriend = friendsList.filter((i) => i)

    useEffect(() => {
        const friendsRef = collection(db, `allFriends/${currentUser && currentUser.uid}/Friends`);
        const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
            const newFriendsList = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id  // Add the document ID to the friend's data
            }));
            setFriendsList(newFriendsList);

        });

        return unsubscribe;
    }, [currentUser && currentUser.uid]);


    const HandleSmsSeen = (id) => {
        const smsRef = doc(db, `allFriends/${id}/Message/${currentUser && currentUser.uid}`);
        const smsRefPhoto = doc(db, `allFriends/${currentUser && currentUser.uid}/Message/${id}`); // Include the document ID here

        closeAllDropdowns();

        updateDoc(smsRef, {
            status: "seen",
        })
        updateDoc(smsRefPhoto, {
            photo: "seen",
        })
            .then(() => {
                // console.log("Message marked as seen successfully.");
            })
            .catch((error) => {
                console.error("Error marking message as seen:", error);
            });
    };

    function closeAllDropdowns() {
        const UserListDiv = document.querySelectorAll('.message-friend-list-div');
        const UserListName = document.querySelectorAll('.message-friend-list-name');
        const UserListTime = document.querySelectorAll('.message-friend-list-time');

        UserListDiv.forEach(userList => {
            userList.style.background = '';
        });
        UserListName.forEach(userListName => {
            userListName.style.color = '';
        });
        UserListTime.forEach(userListTime => {
            userListTime.style.color = '';
        });

    }

    // function PostTimeAgoComponent({ timestamp }) {
    //     const now = new Date();
    //     const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    //     const diffInDays = Math.floor(diffInSeconds / 86400);

    //     if (diffInSeconds < 60) {
    //         return "just now";
    //     } else if (diffInSeconds < 3600) {
    //         const minutes = Math.floor(diffInSeconds / 60);
    //         return `${minutes}min ago`;
    //     } else if (diffInSeconds < 86400) {
    //         const hours = Math.floor(diffInSeconds / 3600);
    //         return `${hours}h ago`;
    //     } else if (diffInDays < 30) { // If less than 30 days (approximately 1 month)
    //         return `${diffInDays}d ago`;
    //     } else {
    //         const months = Math.floor(diffInDays / 30);
    //         return `${months}mo ago`;
    //     }
    // }


    function StatusTimeAgoComponent({ timestamp }) {
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


    function PostTimeAgoComponent({ timestamp }) {
        const now = new Date();
        const messageDate = new Date(timestamp);
        const diffInSeconds = Math.floor((now - messageDate) / 1000);
        const diffInDays = Math.floor(diffInSeconds / 86400);

        if (diffInDays === 0) {
            // Message sent today
            const hours = messageDate.getHours();
            const minutes = messageDate.getMinutes();
            const amOrPm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 === 0 ? 12 : hours % 12;
            return `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${amOrPm}`;
        } else {
            const day = messageDate.getDate();
            const month = messageDate.getMonth() + 1; // Month is zero-based, so add 1
            const year = messageDate.getFullYear();

            return `${day < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}/${year}`;
        }
    }




    const [notiOverlay, setnotiOverlay] = useState(false);

    const notiOverlayfun = () => {
        setnotiOverlay(false)
    }

    const dispatch = useDispatch();
    const userSelected = useSelector((state) => state.counter.userData);

    const getUerData = (id) => {
        dispatch(getUser(id))
    }


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

                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriends();
    }, [currentUser]);


    // 

    const handleEmojiClose = () => {
        dispatch(emojiFalse())
    }

    const handleImgClose = () => {
        dispatch(imgFalse())
    }

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

    // message 
    const handleZOne = () => {
        dispatch(ZindexOne())
    }

    const handleChatOn = () => {
        dispatch(OnChat())
    }

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

    const [search, setSearch] = useState("");
    const [SearchFriend, setSearchFriend] = useState("");
    const [SearchNotifi, setSearchNotifi] = useState("");

    // End

    const totalRequest = friendRequests.filter((i) => i.receiverUid == currentUser.uid);
    const [dsearch, setdsearch] = useState(false);
    const displaySearch = () => {
        setdsearch(!dsearch)
    }
    const [pdsearch, setpdsearch] = useState(false);
    const displayPSearch = () => {
        setpdsearch(!pdsearch)
    }

    const loadingA = [1, 2, 3, 4, 5, 6, 7];

    const [currentStatus, setcurrentStatus] = useState(false);

    const handleCurretnStatas = () => {
        if (statusBoolian) {
            setcurrentStatus(false);
        } else {
            setcurrentStatus(!currentStatus)
        }
    }

    // Status Section

    const [newStoryImage, setNewStoryImage] = useState(null);
    const [progress, setProgress] = React.useState(0);
    const [stories, setStories] = useState([]);

    const videoRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const handleClick = () => {
        const video = videoRef.current;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };



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

    const handleAddStory = async () => {
        if (!newStoryImage) {
            alert('Please select an image.');
            return;
        }

        // Clear the newStoryImage state after checking it to prevent double submissions.
        setNewStoryImage(null);

        const storiesCollection = collection(db, 'stories');
        let downloadURL;

        try {
            const querySnapshot = await getDocs(
                query(storiesCollection, where('uid', '==', currentUser.uid))
            );

            if (querySnapshot.size > 0) {
                const docRef = querySnapshot.docs[0].ref;

                // Compress the image before uploading.
                const compressedImgBlob = await compressImage(newStoryImage, 800);
                const storageRef = ref(storage, `story_images/${newStoryImage.name}`);

                const uploadTask = uploadBytesResumable(storageRef, compressedImgBlob);

                uploadTask.on('state_changed', (snapshot) => {
                    const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    // console.log(`Upload progress: ${progress}%`);
                    setProgress(progress);

                });

                await uploadTask;

                downloadURL = await getDownloadURL(storageRef);

                // Update the existing document with the compressed image.
                await updateDoc(docRef, {
                    image: downloadURL,
                    timestamp: serverTimestamp(),
                });

                // console.log('Image successfully uploaded');
            } else {
                const storageRef = ref(storage, `story_images/${newStoryImage.name}`);

                const uploadTask = uploadBytesResumable(storageRef, newStoryImage);

                uploadTask.on('state_changed', (snapshot) => {
                    const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    // console.log(`Upload progress: ${progress}%`);
                    setProgress(progress);

                    // Show/hide a progress indicator based on the progress percentage.
                    if (progress < 100) {
                    } else {
                    }
                });

                await uploadTask;

                downloadURL = await getDownloadURL(storageRef);

                await addDoc(storiesCollection, {
                    name: newStoryImage ? newStoryImage.name : '',
                    image: newStoryImage ? downloadURL : '',
                    uid: currentUser && currentUser.uid,
                    displayName: currentUser && currentUser.displayName,
                    photoUrl: currentUser.photoURL,
                    visible: true,
                    timestamp: serverTimestamp(),
                });

                // console.log('Video successfully uploaded');
                setProgress(0);
            }

            setStories([...stories, { image: downloadURL }]);

            setNewStoryImage(null);
        } catch (error) {
            console.error('Error adding/updating story:', error);
        }
    };

    const handleReset = () => {
        if (newStoryImage !== null) {
            setNewStoryImage(null);
        }
    }

    const deleteStory = async (storyId) => {
        try {
            const storyRef = doc(db, 'stories', storyId);
            const likesQuerySnapshot = await getDocs(
                collection(db, 'stories', storyId, 'likes')
            );
            const commentQuerySnapshot = await getDocs(
                collection(db, 'stories', storyId, 'comments')
            );

            // Delete the story
            await deleteDoc(storyRef);

            // Delete the corresponding likes
            likesQuerySnapshot.forEach(async (doc) => {
                const likeRef = doc.ref;
                await deleteDoc(likeRef);
            });
            commentQuerySnapshot.forEach(async (doc) => {
                const likeRef = doc.ref;
                await deleteDoc(likeRef);
            });
            setNewStoryImage(null);
        } catch (error) {
            console.error('Error deleting story:', error);
        }
    };

    useEffect(() => {
        const storiesCollection = collection(db, 'stories');
        const q = query(storiesCollection, where('visible', '==', true), orderBy("timestamp", 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedStories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setStories(fetchedStories);
        });

        return () => unsubscribe();
    }, []);

    const [comments, setComments] = useState([]);
    const fetchComments = async (storyId) => {
        try {
            const commentsCollection = collection(db, 'stories', storyId, 'comments');
            const querySnapshot = await getDocs(query(commentsCollection, orderBy('commentTime', 'desc')));
            const fetchedComments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setComments((prevComments) => [...prevComments, ...fetchedComments]);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    useEffect(() => {
        const storiesCollection = collection(db, 'stories');
        const q = query(storiesCollection, where('visible', '==', true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedStories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setStories(fetchedStories);
            fetchedStories.forEach((story) => {
                fetchComments(story.id);
                fetchLike(story.id);
            });
        });

        return () => unsubscribe();
    }, []);

    const [like, setLike] = useState([]);
    const fetchLike = async (storyId) => {
        try {
            const likeCollection = collection(db, 'stories', storyId, 'likes');
            const querySnapshot = await getDocs(query(likeCollection));
            const fetchLike = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setLike(fetchLike);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const filteredComments = comments.filter((item) => item.storyUid === currentUser.uid);
    const Like = like.filter((item) => currentUser.uid === item.storyUid);

    const [storyUid, setStoryUid] = useState(null);

    useEffect(() => {
        const sub = () => {
            const userStory = stories.find(item => item.uid === currentUser?.uid);
            if (userStory) {
                setStoryUid(userStory.uid);
            }
        };

        sub(); // Call the function immediately

        return () => {
            // Clean up code here if necessary
        };
    }, [currentUser, stories]);

    const [showLikes, setShowLikes] = useState(false);
    const HandleShowLike = () => {
        setShowLikes(!showLikes)
        if (showComment === true) {
            setShowComment(false);
        }

    }
    const [showComment, setShowComment] = useState(false);
    const HandleShowComment = () => {
        setShowComment(!showComment)
        if (showLikes === true) {
            setShowLikes(false);
        }

    }


    const statusBoolian = stories.find(i => i.uid === currentUser.uid);
    const statusBoolianr = stories.find(i => i.uid !== currentUser.uid);

    useEffect(() => {
        const handleBeforeUnload = async () => {
            const PresenceRefOnline = doc(db, 'OnlyOnline', currentUser.uid);

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
    }, [currentUser && currentUser.uid]);


    const handleStatus = (id, name, image, photoUrl, time, uid, visible, displayName) => {
        dispatch(statusData(
            {
                id: id,
                name: name,
                image: image,
                photoUrl: photoUrl,
                time: time,
                uid: uid,
                visible: visible,
                overlay: true,
                displayName: displayName,
            }))
    }

    const handleStatusClose = () => {
        dispatch(statusDataClear())
    }

    const handleStatusOn = () => {
        dispatch(statusOn())
    }

    useEffect(() => {
        if (statusBoolian) {
            handleCurretnStatas();
            setNewStoryImage(null)
        }
    }, [statusBoolian]);


    const handleViewStory = async (storyId) => {
        const storyRef = doc(db, 'stories', storyId);

        try {
            // Get the story document
            const storyDoc = await getDoc(storyRef);
            const storyData = storyDoc.data();

            // Get the users who have viewed the story
            const viewedBy = storyData.viewedBy || [];

            // Check if the current user has already viewed the story
            if (!viewedBy.includes(currentUser.uid)) {
                viewedBy.push(currentUser.uid);
                await updateDoc(storyRef, { viewedBy: viewedBy });
            }
        } catch (error) {
            console.error('Error updating story visibility:', error);
        }
    };

    // Update Profile Photo

    const fileInput = useRef(null);

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [img, setImg] = useState(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setProfilePhoto(file);
        handleUpload(file);
        setImg(file);
    };


    const profileDataRef = doc(db, "UpdateProfile", currentUser?.uid ?? 'default');

    const compressImageProfile = async (imageFile, maxWidth) => {
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

    const myId = api.find(i => i.uid === currentUser.uid)


    const handleUpload = async (file) => {
        setLoading(true);

        if (file) {
            if (file.type.startsWith('image/')) {

                try {
                    // Create a Firebase Storage reference to the NewProfilePhotos folder with a unique name

                    const compressedImgBlob = await compressImageProfile(file, 800);

                    const timestamp = new Date().getTime();
                    const storageRef = ref(storage, `NewProfilePhotos/${timestamp}-${file.name}`);

                    // Upload the selected image file to Firebase Storage
                    await uploadBytes(storageRef, compressedImgBlob);
                    // Get download URL for uploaded file
                    const downloadURL = await getDownloadURL(storageRef);

                    // Update user profile with new photoURL
                    await updateProfile(auth.currentUser, { photoURL: downloadURL });

                    await setDoc(profileDataRef, {
                        userPhoto: downloadURL,
                    }, { merge: true });

                    // Update user collection photoUrl
                    const userRef = doc(db, 'users', myId.id);
                    await updateDoc(userRef, { PhotoUrl: downloadURL });

                    // Update OnlyOnline collection photoUrl

                    // console.log(user.uid);
                    const onlineRef = doc(db, 'OnlyOnline', myId.uid);
                    await updateDoc(onlineRef, { photoUrl: downloadURL });

                    // Update AllPost collections post photoUrl 

                    const postsRef = collection(db, 'AllPosts');

                    const userPostsQuery = query(postsRef, where('uid', '==', currentUser && currentUser.uid));
                    const userPostsSnapshot = await getDocs(userPostsQuery);

                    const batch = writeBatch(db);
                    userPostsSnapshot.forEach((postDoc) => {
                        const postRef = doc(db, 'AllPosts', postDoc.id);
                        batch.update(postRef, { photoURL: downloadURL });
                    });

                    await batch.commit();

                    // 

                    const userPostPhotoRef = collection(db, "UserPostPhoto");

                    await addDoc(userPostPhotoRef, {
                        name: img ? img.name : '',
                        img: img ? downloadURL : '', // Only use the downloadURL if a img was uploaded
                        uid: currentUser.uid,
                        photoURL: currentUser.photoURL,
                        displayName: currentUser.displayName,
                        bytime: serverTimestamp(), // Use the server timestamp here
                    });


                    // window.location.reload();

                    // console.log('Profile photo updated successfully!');
                } catch (error) {
                    console.error('Error updating profile photo:', error);
                }

            }
        }

        setLoading(false);

    };

    const [addPrivatePass, setPrivatePass] = useState("");
    const [chatInput, setchatInput] = useState(false);
    const [chatPassId, setchatPassId] = useState(null);
    const [chatLockPass, setchatLockPass] = useState(null);

    const [hDataEId, sethDataEId] = useState(null);
    const [userIdItemId, setuserIdItemId] = useState(null);
    const [accepterDocIdE, setaccepterDocIdE] = useState(null);

    const handlechatInput = (id, pass, eId, userId, DocIdE) => {
        // dispatch(closeChat())
        sethDataEId(eId);
        setuserIdItemId(userId);
        setaccepterDocIdE(DocIdE);

        setchatLockPass(pass)
        setchatPassId(id)
        setchatInput(true)
    }


    const handleChatUnlock = async (chatPass) => {
        // const messageData1 = {
        //     userId: currentUser.uid,

        // };

        // if (chatPass != addPrivatePass) {
        //     return
        // }

        try {
            const messageData2 = {
                userId: chatPassId,
                PrivatePass: addPrivatePass,
                chatLock: false
            };

            // const docRef1 = doc(db, `allFriends/${uid}/Message`, currentUser.uid);
            const docRef2 = doc(db, `allFriends/${currentUser && currentUser.uid}/Message`, chatPassId);

            const promises = [];

            // promises.push(setDoc(docRef1, messageData1, { merge: true }));
            promises.push(updateDoc(docRef2, messageData2, { merge: true }));

            await Promise.all(promises);
            setPrivatePass("");
            handlechatInput();
        } catch (e) {
            console.log(e);
        }

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

    useEffect(() => {
        handleChatlock();
    }, [currentUser && currentUser.uid]);

    const closeChatStatus = useSelector(state => state.counter.chatStatas);

    useEffect(() => {
        // Check if addPrivatePass matches the correct password
        // console.log(addPrivatePass)
        // console.log("Pass: ", chatLockPass)
        if (addPrivatePass === chatLockPass) {
            handleChatUnlock();

            handlePrivateDataLock()
            handlePrivateData(false)

            setchatInput(false)
            HandleSmsSeen(chatPassId);
            // handalData(hDataEId, userIdItemId, accepterDocIdE);

        }
    }, [addPrivatePass, chatLockPass]);

    const handlePrivateData = (id) => {
        dispatch(handlePrivaeData({ id }))
    }
    const handlePrivateDataLock = () => {
        dispatch(handlePrivaeDataClear())
    }

    return (
        <div className='user-main' onClick={() => { handleEmojiClose(); handleImgClose(); }}>


            <div className="navbar-div">
                {dsearch ?

                    (<div className="nav-search-input-div">
                        <FaArrowLeft onClick={() => setdsearch(false)} style={{ cursor: "pointer" }} />
                        <input type="text" placeholder='Search friends' onChange={(e) => setSearchFriend(e.target.value)}
                            value={SearchFriend} className='nav-search-input' />
                    </div>)

                    :

                    (<div className='nav-inner'>
                        <div className='d-flex align-items-center'>

                            {statusBoolian ?
                                <img src={currentUser && currentUser.photoURL} className='nav-img-ring' alt="" onClick={handleOption} />
                                :
                                <img src={currentUser && currentUser.photoURL} className='nav-img' alt="" onClick={handleOption} />
                            }

                            <div className='statusIcon-div'>
                                <img src={statusicon} className='statusIcon' alt="" onClick={handlestory} />

                                {stories.slice(0, 1).map((item) => {
                                    return (
                                        <>
                                            {!item.viewedBy || !item.viewedBy.includes(currentUser.uid) ?
                                                <div className="newstatus"></div>
                                                :
                                                null}
                                        </>
                                    )
                                })}

                            </div>

                        </div>

                        <div style={{ flex: "1" }}></div>

                        <div className='nav-people-div'>
                            <IoSearch className='nav-search-icon' onClick={displaySearch} />
                            <BsPeopleFill className='nav-icons' onClick={handlePeople} />
                            {friendRequests.map((item) => {
                                if (item.receiverUid === currentUser.uid && item.status !== 'accepted') {
                                    return (
                                        <div className='nav-people-count'>
                                            {totalRequest.length}
                                        </div>
                                    )
                                }

                            })}
                        </div>
                    </div>)

                }
            </div>

            <div className="user-container">
                {loadingRight ?
                    <>
                        {loadingA.map((i) => {
                            return (
                                <div key={i.id} className="placeholder-div placeholder-glow">
                                    <div className="placeholder"></div>
                                </div>
                            )
                        })}
                    </>
                    :

                    <FlipMove>
                        {messages.filter((value) => {
                            if (SearchFriend === "") {
                                return value;
                            } else if (
                                value.name.toLowerCase().includes(SearchFriend.toLowerCase())
                            ) {
                                return value;
                            }
                        }).map((item) => {
                            return (
                                <div key={item.id}>

                                    {FilterFriend.map((e) => {
                                        if (e.uid == item.userId) {

                                            return (
                                                <div key={e.id} className={`user-div ${userSelected == item.id ? "selected" : ""}`}

                                                    onClick={() => {
                                                        if (item.chatLock) {
                                                            handalData(e.id, item.userId, e.accepterDocId, item.userId)
                                                            dispatch(closeChat())
                                                            handleZOne();
                                                            handleChatOn();
                                                            // handleChatUnlock();
                                                            getUerData(item.id);
                                                            handlechatInput(item.id, item.PrivatePass, e.id, item.uid, e.accepterDocId, e.senderDocId);
                                                            handlePrivateDataLock();
                                                            handlePrivateData(item.chatLock)

                                                        } else {
                                                            dispatch(closeChat())
                                                            HandleSmsSeen(item.id);
                                                            handalData(e.id, item.userId, e.accepterDocId, item.userId, e.senderDocId);
                                                            getUerData(item.id);
                                                            handleZOne();
                                                            handleChatOn();
                                                            setchatInput(false);
                                                            handlePrivateDataLock();
                                                            handlePrivateData(false)
                                                            if (item.chatLock === false) {
                                                                return
                                                            } else {
                                                                handleChatlock();

                                                            }
                                                        }
                                                    }}>

                                                    <div style={{ display: "flex" }}>

                                                        <div>
                                                            {api.map((indexId) => {
                                                                if (indexId.uid === e.uid) {
                                                                    return (
                                                                        <>
                                                                            <img src={indexId.PhotoUrl} className='user-img' alt="" />

                                                                        </>
                                                                    )
                                                                }
                                                            })}

                                                        </div>

                                                        <div className='user-name-div'>

                                                            {chatPassId === item.userId && chatInput ?
                                                                <>
                                                                    <input autoFocus type="password" value={addPrivatePass} className='chatInput' onChange={(e) => setPrivatePass(e.target.value)} placeholder='Password'
                                                                    />
                                                                </>
                                                                :
                                                                <div className="user-name" >
                                                                    {item.name}
                                                                </div>
                                                            }

                                                            {item.chatLock ?
                                                                null
                                                                :
                                                                <>   {
                                                                    typingS.map((item) => {
                                                                        if (e.uid === item.id) {
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
                                                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                                                            {sendedMessage.map((item) => {
                                                                                                if (item.userId === e.uid) {
                                                                                                    return (
                                                                                                        <div key={item.id}>

                                                                                                            <div className='message-seen-div text-lightPostIcon dark:text-darkPostIcon'>

                                                                                                                <div className="seen-check-mark">

                                                                                                                    {item.status == "seen" ?

                                                                                                                        <BiCheckDouble style={{ fontSize: "18px", color: "#007bff", marginRight: "5px" }} />
                                                                                                                        :
                                                                                                                        null
                                                                                                                    }
                                                                                                                    <div style={{ fontSize: "13px" }}>
                                                                                                                    </div>
                                                                                                                </div>

                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )
                                                                                                }
                                                                                            })}

                                                                                            {/* <motion.div
                                                                                initial={{ opacity: 0 }}
                                                                                animate={{ opacity: 1 }}
                                                                                transition={{ duration: 0.6 }}
                                                                                className='latestSms'>{e && e.latestSms}</motion.div> */}
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            )
                                                                        }
                                                                    })
                                                                }
                                                                </>
                                                            }

                                                        </div>
                                                    </div>


                                                    <>
                                                        {item.photo === "unseen" ?

                                                            (<div className='date-time' style={{ color: "#25d366", fontWeight: 600 }}>
                                                                {item.chatLock ?
                                                                    <HiLockClosed style={{ fontSize: "20px" }} />
                                                                    :
                                                                    <>
                                                                        {item.count}  <PostTimeAgoComponent timestamp={item.time && item.time.toDate()} />
                                                                    </>

                                                                }
                                                            </div>)
                                                            :
                                                            (<div className='date-time' >
                                                                {item.chatLock ?
                                                                    <HiLockClosed style={{ fontSize: "20px" }} />
                                                                    :
                                                                    <>
                                                                        <PostTimeAgoComponent timestamp={item.time && item.time.toDate()} />
                                                                    </>
                                                                }
                                                            </div>)
                                                        }
                                                    </>

                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                            )
                        })}
                    </FlipMove>
                }
            </div>

            <div >
                <motion.div
                    animate={{
                        // opacity: option ? 0 : 1,
                        zIndex: option ? -1 : 1,
                    }}
                    transition={{ duration: 0.7, type: "spring" }}
                    className="option-container" >
                    <div className="option-nav-div">
                        <FaArrowLeft onClick={handleOption} style={{ cursor: "pointer" }} />
                    </div>

                    <motion.div
                        animate={{
                            // opacity: option ? 0 : 1,
                            zIndex: option ? -1 : 1,
                            y: option ? 20 : 0
                        }}
                        transition={{ duration: 0.7, type: "spring" }}
                        className="user-account-div">

                        <div className="user-account-img-div">

                            <label htmlFor="profile-img" >
                                {loading ?
                                    <div className="user-img-load">
                                        <CircularProgress style={{ color: "#ffff", width: "30px", height: "30px" }} />
                                    </div>
                                    :
                                    <div className="user-img-camera-div">
                                        <FaCamera className='user-img-camera' />
                                    </div>
                                }
                            </label>

                            <img src={currentUser && currentUser.photoURL} className='user-account-img' alt="" />
                            <input type="button" id='profile-img' value="Select Image" style={{ display: "none" }} onClick={() => fileInput.current.click()} />
                            <input type="file" ref={fileInput} style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
                        </div>

                        <div className="user-account-name-div">
                            <div className='user-account-name'>{currentUser && currentUser.displayName}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{
                            // opacity: option ? 0 : 1,
                            zIndex: option ? -1 : 1,
                            y: option ? 30 : 0
                        }}
                        transition={{ duration: 0.7, type: "spring" }}
                        className="option-item-div">
                        <div className='option-item'>
                            Dark Theme
                            <BsMoonStarsFill style={{ fontSize: "20px" }} />
                        </div>
                        <div className='option-item'>
                            Account
                            <FaUser style={{ fontSize: "24px" }} />
                        </div>
                        <div className='option-item'>
                            Setting
                            <div>
                                <AiFillSetting style={{ fontSize: "26px" }} />
                            </div>
                        </div>

                        <motion.div
                            transition={{ duration: 0.7 }}
                            className='option-item'>
                            LogOut

                            <div className="btn-out" onClick={() => LogOut()}>

                                {LoadingLogout ?
                                    <CircularProgress style={{ width: "25px", height: "25px", margin: "3.5px", color: "#128c7e" }} />
                                    :
                                    <ThemeProvider theme={theme}>
                                        <Switch
                                            checked={checked}
                                            onChange={handleChange}
                                            inputProps={{ 'aria-label': 'controlled' }}
                                            color="primary"
                                        />
                                    </ThemeProvider>
                                }
                            </div>

                        </motion.div>
                    </motion.div>

                </motion.div>

                <motion.div
                    animate={{ zIndex: people ? -1 : 1, opacity: option ? 1 : 0 }}
                    transition={{ duration: 0.7, type: "spring" }}
                    className="people-container" >

                    <div className="people-nav-div"
                        style={{
                            background: pdsearch ? "#075e54" : "",
                            borderBottom: pdsearch ? "1px solid rgba(255, 255, 255, 0.363)" : "1px solid rgba(255, 255, 255, 0.123)"

                        }}>
                        {pdsearch ?
                            <FaArrowLeft onClick={() => { setpdsearch(false); setSearch("") }}
                                style={{ cursor: "pointer", marginRight: "1rem" }} />
                            :
                            <FaArrowLeft onClick={() => { handlePeople(); handalTabs("noti"); notiOverlayfun(); setSearch("") }} style={{ cursor: "pointer" }} />
                        }
                        {pdsearch ?
                            <>
                                {tabs == "noti" ?
                                    <input value={SearchNotifi} onChange={(e) => setSearchNotifi(e.target.value)} type="text" className='option-search' placeholder='Search' />
                                    :
                                    <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" className='option-search' placeholder='Search friends' />
                                }
                            </>
                            :

                            <div className="people-nav-inner">
                                <div className='people-nav-item' onClick={() => handalTabs("noti")}>
                                    {tabs == "noti" ?
                                        <div style={{ color: "white", display: "flex", alignItems: "center" }}>
                                            <FaBell />  <span className='ms-2'>Notification</span>
                                        </div>
                                        :
                                        <div style={{ color: "#cccc", display: "flex", alignItems: "center" }}>
                                            <FaBell /> <span className='ms-2'>Notification</span>
                                        </div>
                                    }
                                </div>

                                <div className='people-nav-item' onClick={() => handalTabs("sugg")}>

                                    {tabs == "sugg" ?
                                        <div style={{ color: "white", display: "flex", alignItems: "center" }}>
                                            <FaUser /> <span className='ms-2'>Suggested for you</span>
                                        </div>
                                        :
                                        <div style={{ color: "#cccc", display: "flex", alignItems: "center" }}>
                                            <FaUser /> <span className='ms-2'>Suggested for you</span>
                                        </div>
                                    }
                                </div>

                                <IoSearch style={{ fontSize: "20px", cursor: "pointer" }} onClick={displayPSearch} />
                            </div>
                        }
                    </div>

                    <motion.div
                        animate={{ y: people ? 30 : 0, opacity: option ? 1 : 0 }}
                        transition={{ duration: 0.7, type: "spring" }}
                    >
                        {tabs == "noti" ?
                            <div className="notification-container-div notification-container ">
                                <Notification SearchNotifi={SearchNotifi} notiOverlay={setnotiOverlay} notiOverlayTrue={notiOverlay} />
                            </div>
                            :
                            null
                        }

                        {tabs == "sugg" ?
                            <div className="notification-container-div Suggest-container">
                                <UsersData search={search} />
                            </div>

                            :
                            null
                        }
                    </motion.div>
                </motion.div>

                {/* Story Section --------------------- */}

                <motion.div
                    animate={{ zIndex: story ? -1 : 1, }}
                    transition={{ duration: 0.7, type: "spring" }}
                    className="people-container" >
                    {!currentStatus &&
                        <div className="people-nav-div"
                            style={{
                                background: pdsearch ? "#075e54" : "",
                                borderBottom: pdsearch ? "1px solid rgba(255, 255, 255, 0.363)" : "1px solid rgba(255, 255, 255, 0.123)"

                            }}>
                            <FaArrowLeft onClick={() => { handlestory() }}
                                style={{ cursor: "pointer", marginRight: "1rem" }} />
                        </div>
                    }


                    {currentStatus ?
                        // My Status Add
                        <div className="add-current-status">
                            <div className="people-nav-div"
                                style={{
                                    background: pdsearch ? "#075e54" : "",
                                    borderBottom: pdsearch ? "1px solid rgba(255, 255, 255, 0.363)" : "1px solid rgba(255, 255, 255, 0.123)"

                                }}>
                                <FaArrowLeft onClick={() => { handleCurretnStatas(); setNewStoryImage(false); }}
                                    style={{ cursor: "pointer", marginRight: "1rem" }} />
                            </div>
                            {/* center */}

                            <div className="add-current-staus-center">

                                {progress > 0 &&
                                    <div className='story-progress'>
                                        {progress}
                                        <div className='mt-2' style={{ fontSize: "15px" }}>Sending...</div>
                                    </div>
                                }

                                <div className='selected-story-card'>
                                    {newStoryImage && newStoryImage.type.startsWith('image/') && (
                                        <>
                                            <img className="story-img-object" src={URL.createObjectURL(newStoryImage)} alt="" />
                                        </>
                                    )}

                                    {newStoryImage && newStoryImage.type.startsWith('video/') && (
                                        <div className="story-img-object">
                                            <video ref={videoRef} onClick={handleClick} className="story-video-object ">
                                                <source src={URL.createObjectURL(newStoryImage)} type={newStoryImage.type} />
                                            </video>
                                        </div>
                                    )}

                                    {!newStoryImage &&
                                        <div className="empty-story-text">
                                            {statusBoolian ?
                                                <>
                                                    <img src={statusicon} style={{ width: "30px" }} alt="" />
                                                    <div className='mt-2' style={{ color: "#25d366" }}>Status Updated</div>
                                                </>
                                                :
                                                <>
                                                    <img src={statusicon} style={{ width: "30px" }} alt="" />
                                                    <div className='mt-2'>Add Status</div>
                                                </>
                                            }

                                        </div>
                                    }
                                </div>

                            </div>

                            {/* bottom */}
                            <div className="add-current-staus-bottom">
                                <input
                                    style={{ display: "none" }}
                                    className='my-2 story-add-input'
                                    id='Add-story'
                                    type="file"
                                    onChange={(e) => setNewStoryImage(e.target.files[0])}
                                    accept="image/*, video/*"
                                />

                                <VscSmiley className='add-current-bottom-icons' />

                                <label htmlFor="Add-story" onClick={() => { handleReset(); setNewStoryImage(null); }}>
                                    <ImLink className='ms-4 add-current-bottom-icons' />
                                </label>

                                <input type="text" placeholder='Write a update' className='add-current-input mx-3' />
                                <IoSend className='add-current-bottom-icons' onClick={handleAddStory} />
                            </div>
                        </div>
                        :
                        // All Friends Status code

                        <div className="status-mian-div">
                            <h5>Status</h5>

                            <div className="status-current-user my-3" onClick={() => {
                                handleCurretnStatas();
                                statusBoolian ? handleStatusOn() : handleStatusClose();
                            }}>
                                {statusBoolian ?
                                    <div><img src={currentUser && currentUser.photoURL} className='current-user-img-ring' alt="" /></div>
                                    :
                                    <div><img src={currentUser && currentUser.photoURL} className='current-user-img' alt="" /></div>
                                }
                                <div className='ms-3'>
                                    <div style={{ fontSize: "16px", fontWeight: 600 }}>My Status</div>
                                    <div style={{ color: "#ccc", fontSize: "14px" }}>

                                        {statusBoolian ? null :
                                            (<>
                                                {progress ? "Sending" : "Not update"}
                                            </>)
                                        }

                                    </div>
                                </div>
                            </div>

                            <div style={{ fontSize: "14px", color: "#ccc" }} className='mb-3'>View updates</div>

                            {stories.map((item) => {

                                if (item.uid !== currentUser.uid)

                                    return (
                                        <div key={item.id}>
                                            {friendsList.map((friend) => {

                                                if (item.uid === friend.uid) {
                                                    return (
                                                        <div className="status-current-user mb-1"
                                                            key={friend.id}
                                                            onClick={() => {
                                                                handleStatus(
                                                                    item.id, item.name, item.image, item.photoUrl,
                                                                    item.timestamp, item.uid, item.visible, item.displayName

                                                                ); handleViewStory(item.id);
                                                            }}>


                                                            {!item.viewedBy || !item.viewedBy.includes(currentUser.uid) ?
                                                                <div><img src={item.photoUrl} className='current-user-img-ring' alt="" /></div>
                                                                :
                                                                <div><img src={item.photoUrl} className='current-user-img' alt="" /></div>
                                                            }

                                                            <div className='ms-3'>
                                                                <div style={{ fontSize: "14px", fontWeight: 600, textTransform: "capitalize" }}>{item.displayName}</div>
                                                                <div style={{ color: "#ccc", fontSize: "13px" }}>
                                                                    <StatusTimeAgoComponent timestamp={item.timestamp && item.timestamp.toDate()} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    )
                            })}

                        </div>

                    }
                </motion.div>
            </div >
        </div >
    )
}

export default UserComponent