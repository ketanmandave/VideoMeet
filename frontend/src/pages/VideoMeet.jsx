import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Typography, Avatar } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import styles from "../styles/videoComponent.module.css";

const server_url = process.env.NODE_ENV === "production" 
  ? "https://your-app-backend-1dz5.onrender.com" 
  : "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    'iceServers': [
        { 'urls': 'stun:stun.l.google.com:19302' },
        {
            'urls': 'turn:numb.viagenie.ca',
            'credential': 'muazkh',
            'username': 'webrtc'
        }
    ]
};

const VideoMeet = () => {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState(false);
    let [showModal, setModal] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState(false);
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [isScreenSharing, setIsScreenSharing] = useState(false);

    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    // Calculate grid layout based on number of participants
    const getGridLayout = (participantCount) => {
        if (participantCount <= 1) return { cols: 1, rows: 1 };
        if (participantCount <= 2) return { cols: 2, rows: 1 };
        if (participantCount <= 4) return { cols: 2, rows: 2 };
        if (participantCount <= 6) return { cols: 3, rows: 2 };
        if (participantCount <= 9) return { cols: 3, rows: 3 };
        if (participantCount <= 12) return { cols: 4, rows: 3 };
        return { cols: 4, rows: Math.ceil(participantCount / 4) };
    };

    const totalParticipants = videos.length + 1; // +1 for local user
    const gridLayout = getGridLayout(totalParticipants);

    let getDislayMedia = () => {
        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(getDislayMediaSuccess)
                .catch((e) => {
                    console.log(e);
                    setScreen(false);
                    setIsScreenSharing(false);
                });
        }
    };

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable
                });

                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                    setVideo(true);
                    setAudio(true);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getPermissions();
    }, []);

    let getUserMediaSuccess = (stream) => {
        // try {
        //     window.localStream.getTracks().forEach(track => track.stop());
        // } catch (e) { console.log(e); }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        });
    };

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({
                video: video && videoAvailable,
                audio: audio && audioAvailable,
            })
                .then(getUserMediaSuccess)
                .catch((err) => { console.log(err); });
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            } catch (error) {
                console.log(error);
            }
        }
    };

    useEffect(() => {
        if (video !== null || audio !== null) {
            getUserMedia();
        }
    }, [video, audio]);

    let gorMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);

        if (fromId === socketIdRef.current) return;

        if (!connections[fromId]) {
            console.warn(`No connection found for ${fromId}. Ignoring signal.`);
            return;
        }

        if (signal.sdp) {
            if (connections[fromId].signalingState !== "stable" || signal.sdp.type === "offer") {
                connections[fromId]
                    .setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            return connections[fromId].createAnswer();
                        }
                    })
                    .then((description) => {
                        if (description) {
                            return connections[fromId].setLocalDescription(description);
                        }
                    })
                    .then(() => {
                        socketRef.current.emit(
                            "signal",
                            fromId,
                            JSON.stringify({ sdp: connections[fromId].localDescription })
                        );
                    })
                    .catch((e) => console.error("Error handling remote SDP:", e));
                    } else {
                        console.log(`Skipping duplicate SDP from ${fromId}, state=${connections[fromId].signalingState}`);
                    }
                }

            if (signal.ice) {
                if (
                    connections[fromId].remoteDescription &&
                    connections[fromId].remoteDescription.type
                ) {
                    connections[fromId]
                        .addIceCandidate(new RTCIceCandidate(signal.ice))
                        .catch((e) => console.error("Error adding ICE candidate:", e));
                }
            }
        };

        let getDislayMediaSuccess = (stream) => {
            try {
                window.localStream.getTracks().forEach(track => track.stop());
            } catch (e) { console.log(e); }

            window.localStream = stream;
            localVideoref.current.srcObject = stream;
            setIsScreenSharing(true);

            for (let id in connections) {
                if (id === socketIdRef.current) continue;

                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }

            stream.getTracks().forEach(track => track.onended = () => {
                setScreen(false);
                setIsScreenSharing(false);

                try {
                    let tracks = localVideoref.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                } catch (e) { console.log(e); }

                getUserMedia();
            });
        };

        let connectToSocketServer = () => {
            socketRef.current = io.connect(server_url, { secure: false });

            socketRef.current.on('signal', gorMessageFromServer);

            socketRef.current.on('connect', () => {
                socketRef.current.emit('join-call', window.location.href);
                socketIdRef.current = socketRef.current.id;

                socketRef.current.on('chat-message', addMessage);

                socketRef.current.on('user-left', (id) => {
                    setVideos((videos) => videos.filter((video) => video.socketId !== id));
                    if (connections[id]) {
                        connections[id].close();
                        delete connections[id];
                    }
                });

                socketRef.current.on('user-joined', (id, clients) => {
                    clients.forEach((socketListId) => {
                        if (!connections[socketListId]) {
                            connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                        }

                        connections[socketListId].onicecandidate = function (event) {
                            if (event.candidate != null) {
                                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        };

                        connections[socketListId].onaddstream = (event) => {
                            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                            if (videoExists) {
                                setVideos(videos => {
                                    const updatedVideos = videos.map(video =>
                                        video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                    );
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            } else {
                                let newVideo = {
                                    socketId: socketListId,
                                    stream: event.stream,
                                    autoplay: true,
                                    playsinline: true
                                };

                                setVideos(videos => {
                                    const updatedVideos = [...videos, newVideo];
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            }
                        };

                        if (window.localStream !== undefined && window.localStream !== null) {
                            connections[socketListId].addStream(window.localStream);
                        } else {
                            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                            window.localStream = blackSilence();
                            connections[socketListId].addStream(window.localStream);
                        }
                    });

                    if (id === socketIdRef.current) {
                        for (let id2 in connections) {
                            if (id2 === socketIdRef.current) continue;

                            try {
                                connections[id2].addStream(window.localStream);
                            } catch (e) { }

                            connections[id2].createOffer().then((description) => {
                                connections[id2].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                                    })
                                    .catch(e => console.log(e));
                            });
                        }
                    }
                });
            });
        };

        let getMedia = () => {
            // ✅ Just connect to socket and use already-initialized local stream
            if (!window.localStream) {
                console.warn("No local stream available! Requesting permission...");
                getPermissions().then(connectToSocketServer);
            } else {
                connectToSocketServer();
            }
        };

        let silence = () => {
            let ctx = new AudioContext();
            let oscillator = ctx.createOscillator();
            let dst = oscillator.connect(ctx.createMediaStreamDestination());
            oscillator.start();
            ctx.resume();
            return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
        };

        let black = ({ width = 640, height = 480 } = {}) => {
            let canvas = Object.assign(document.createElement("canvas"), { width, height });
            canvas.getContext('2d').fillRect(0, 0, width, height);
            let stream = canvas.captureStream();
            return Object.assign(stream.getVideoTracks()[0], { enabled: false });
        };

        let handleVideo = () => {
            setVideo(!video);
        };

        let handleAudio = () => {
            setAudio(!audio);
        };

        useEffect(() => {
            if (screen !== undefined) {
                getDislayMedia();
            }
        }, [screen]);

        let handleScreen = () => {
            setScreen(!screen);
        };

        let handleEndCall = () => {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { }

            // Close all peer connections
            Object.keys(connections).forEach(id => {
                if (connections[id]) {
                    connections[id].close();
                }
            });

            // Disconnect socket
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            window.location.href = "/home";
        };

        let openChat = () => {
            setModal(true);
            setNewMessages(0);
        };

        let closeChat = () => {
            setModal(false);
        };

        const addMessage = (data, sender, socketIdSender) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: sender, data: data }
            ]);
            if (socketIdSender !== socketIdRef.current) {
                setNewMessages((prevNewMessages) => prevNewMessages + 1);
            }
        };

        let sendMessage = () => {
            if (message.trim() && socketRef.current) {
                socketRef.current.emit('chat-message', message, username);
                setMessage("");
            }
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        };

        let connect = () => {
            if (username.trim()) {
                setAskForUsername(false);
                getMedia();
            }
        };

        // Generate user initials for avatar
        const getInitials = (name) => {
            return name ? name.charAt(0).toUpperCase() : 'U';
        };

        return (
            <div style={{ height: '100vh', backgroundColor: '#1a1a1a', position: 'relative' }}>
                {askForUsername ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        gap: '20px',
                        backgroundColor: '#2a2a2a',
                        color: 'white'
                    }}>
                        <Typography variant="h4" gutterBottom>
                            Join Meeting
                        </Typography>
                        <TextField
                            label="Enter your name"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            variant="outlined"
                            onKeyPress={(e) => e.key === 'Enter' && connect()}
                            style={{ backgroundColor: 'white', borderRadius: '4px' }}
                        />
                        <Button
                            variant="contained"
                            onClick={connect}
                            disabled={!username.trim()}
                            size="large"
                            style={{ backgroundColor: '#0066cc', padding: '12px 24px' }}
                        >
                            Join Meeting
                        </Button>

                        <div style={{
                            marginTop: '30px',
                            border: '2px solid #444',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <video
                                ref={localVideoref}
                                autoPlay
                                muted
                                style={{ width: '320px', height: '240px' }}
                            />
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Chat Modal */}
                        {showModal && (
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '350px',
                                height: '500px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #e0e0e0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '8px 8px 0 0'
                                }}>
                                    <Typography variant="h6">Chat</Typography>
                                    <IconButton onClick={closeChat} size="small">
                                        <CloseIcon />
                                    </IconButton>
                                </div>

                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    {messages.length === 0 ? (
                                        <Typography color="textSecondary" style={{ textAlign: 'center', marginTop: '20px' }}>
                                            No messages yet
                                        </Typography>
                                    ) : (
                                        messages.map((item, index) => (
                                            <div key={index} style={{
                                                padding: '8px 12px',
                                                backgroundColor: item.sender === username ? '#e3f2fd' : '#f5f5f5',
                                                borderRadius: '8px',
                                                alignSelf: item.sender === username ? 'flex-end' : 'flex-start',
                                                maxWidth: '80%'
                                            }}>
                                                <Typography variant="caption" style={{ fontWeight: 'bold', color: '#666' }}>
                                                    {item.sender}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {item.data}
                                                </Typography>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div style={{
                                    padding: '16px',
                                    borderTop: '1px solid #e0e0e0',
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <TextField
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        variant="outlined"
                                        size="small"
                                        style={{ flex: 1 }}
                                    />
                                    <IconButton
                                        onClick={sendMessage}
                                        color="primary"
                                        disabled={!message.trim()}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </div>
                            </div>
                        )}

                        {/* Video Grid */}
                        <div style={{
                            flex: 1,
                            display: 'grid',
                            gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
                            gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
                            gap: '4px',
                            padding: '8px',
                            backgroundColor: '#1a1a1a'
                        }}>
                            {/* Local Video */}
                            <div style={{
                                position: 'relative',
                                backgroundColor: '#2a2a2a',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '2px solid #0066cc'
                            }}>
                                <video
                                    ref={localVideoref}
                                    autoPlay
                                    muted
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    left: '8px',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <Avatar style={{ width: 20, height: 20, fontSize: '10px' }}>
                                        {getInitials(username)}
                                    </Avatar>
                                    You {isScreenSharing && '(Screen)'}
                                </div>
                                {!video && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}>
                                        <Avatar style={{ width: 60, height: 60, margin: '0 auto 8px', backgroundColor: '#666' }}>
                                            {getInitials(username)}
                                        </Avatar>
                                        <Typography style={{ color: 'white', fontSize: '14px' }}>
                                            Camera Off
                                        </Typography>
                                    </div>
                                )}
                            </div>

                            {/* Remote Videos */}
                            {videos.map((video) => (
                                <div
                                    key={video.socketId}
                                    style={{
                                        position: 'relative',
                                        backgroundColor: '#2a2a2a',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <video
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        left: '8px',
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Avatar style={{ width: 20, height: 20, fontSize: '10px' }}>
                                            {getInitials(`User-${video.socketId.slice(-4)}`)}
                                        </Avatar>
                                        User-{video.socketId.slice(-4)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controls */}
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#2a2a2a',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '16px',
                            borderTop: '1px solid #444'
                        }}>
                            <IconButton
                                onClick={handleVideo}
                                style={{
                                    backgroundColor: video ? '#4caf50' : '#f44336',
                                    color: 'white',
                                    width: '50px',
                                    height: '50px'
                                }}
                            >
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>

                            <IconButton
                                onClick={handleAudio}
                                style={{
                                    backgroundColor: audio ? '#4caf50' : '#f44336',
                                    color: 'white',
                                    width: '50px',
                                    height: '50px'
                                }}
                            >
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>

                            {screenAvailable && (
                                <IconButton
                                    onClick={handleScreen}
                                    style={{
                                        backgroundColor: screen ? '#ff9800' : '#666',
                                        color: 'white',
                                        width: '50px',
                                        height: '50px'
                                    }}
                                >
                                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            )}

                            <Badge badgeContent={newMessages} color="error">
                                <IconButton
                                    onClick={openChat}
                                    style={{
                                        backgroundColor: showModal ? '#2196f3' : '#666',
                                        color: 'white',
                                        width: '50px',
                                        height: '50px'
                                    }}
                                >
                                    <ChatIcon />
                                </IconButton>
                            </Badge>

                            <IconButton
                                onClick={handleEndCall}
                                style={{
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    width: '50px',
                                    height: '50px'
                                }}
                            >
                                <CallEndIcon />
                            </IconButton>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default VideoMeet;    