import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

// ===========================================================================================================

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [screenStream, setScreenStream] = useState(null); // State to track screen sharing stream
  const [showScreenShare, setShowScreenShare] = useState(false); // State to toggle screen share visibility

  // ======================= handleUserJoined ==============================

  // Set the room id and console the user had joined
  const handleUserJoined = useCallback(({ name, id }) => {
    setRemoteSocketId(id);
  }, []);

  // ======================= permissions ==================================

  // After redirect to my room page first taking Permissions to user
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  // ================== End the User Stream and Call =============================

  const handleEndUser = useCallback(async () => {
    try {
      await peer.endCall(remoteSocketId);
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
        setMyStream(null);
      }
      if (remoteStream) {
        setRemoteStream(null);
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
        setShowScreenShare(false);
      }
    } catch (error) {
      console.error("Error ending call:", error);
    }
  }, [myStream, remoteSocketId, remoteStream, screenStream]);

  // ==================== Room Disconnect ===============================

  const handleRoomDisconnect = () => {
    window.location.href = "/";
  };

  // ===================== ScreenShare ==============================

  // Function to start screen sharing
  const handleStartScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setScreenStream(screenStream);
      setShowScreenShare(true);
      peer.peer.addStream(screenStream);
      socket.emit("screen:share", { screenData: screenStream });
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  }, [socket]);

  const handleStopScreenShare = useCallback(() => {
    setScreenStream(null);
    setShowScreenShare(false);
    peer.peer.removeStream(screenStream);
  }, [screenStream]);

  // ===================== Screen Sharing Stream ==============================

  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [screenStream]);

  // Listen for screen sharing event from server
  useEffect(() => {
    socket.on("screen:shared", (stream) => {
      setShowScreenShare(true);
      setScreenStream(stream);
    });

    return () => {
      socket.off("screen:shared");
    };
  }, [socket]);

  // ==============================================================================

  useEffect(() => {
    // Add screen stream to peer connection when available
    if (myStream && screenStream) {
      peer.peer.addStream(screenStream);
    }
  }, [myStream, screenStream]);

  useEffect(() => {
    peer.peer.addEventListener("track", (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handleIncommingCall = useCallback(
    async ({ from, offer, userId }) => {
      setRemoteSocketId(userId);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  // ==============================================================================

  const sendStreams = useCallback(() => {
    // Track the tracks that have already been added
    const addedTracks = new Set();

    // Get all tracks from the user's media stream
    myStream.getTracks().forEach((track) => {
      // Check if the track is not already added
      if (!addedTracks.has(track.id)) {
        // Add the track to the peer connection
        const sender = peer.peer.addTrack(track, myStream);

        // Track the added track
        addedTracks.add(track.id);
      }
    });
  }, [myStream, peer.peer]);

  // ==============================================================================

  const handleCallAccepted = useCallback(
    ({ from, ans, userId }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  // ==============================================================================

  const handleRemoteTrack = (ev) => {
    const remoteStream = ev.streams;
    console.log("GOT TRACKS!!");
    setRemoteStream(remoteStream[0]);
  };

  // ==============================================================================

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  // ==============================================================================

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  // ==============================================================================

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  // ================= Handle all events =================================

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  // ================== handling Message / Chat =========================

  const messageInput = document.querySelector("input");
  const allMessages = document.getElementById("messages");

  socket.on("message", (message) => {
    const p = window.document.createElement("p");
    p.innerText = message;

    if (allMessages) {
      allMessages.appendChild(p);
    }
  });

  const handleable = () => {
    socket.emit("chat", messageInput.value);
  };

  // ==============================================================================

  return (
    <div>
      <h1 className="heading">SabhaSthal</h1>
      <h3 className="on-off">
        {remoteSocketId ? "Connected" : "No one in room"}
      </h3>
      <div className="video-container">
        {myStream && (
          <button className="button-Send" onClick={sendStreams}>
            Send Stream
          </button>
        )}
        {remoteSocketId && (
          <button className="button-Call" onClick={handleCallUser}>
            CALL
          </button>
        )}
        {/* Button to start screen share */}
        {!showScreenShare && (
          <button
            className="button-ScreenShare"
            onClick={handleStartScreenShare}
          >
            Share Screen
          </button>
        )}
        {/* Button to stop screen share */}
        {showScreenShare && (
          <button
            className="button-EndScreenShare"
            onClick={() => setScreenStream(null)}
          >
            Stop Sharing Screen
          </button>
        )}

        <div className="video-Room">
          {myStream && (
            <>
              <div>
                {/* Display name associated with the user's camera stream */}
              </div>
              <ReactPlayer
                playing
                muted
                width="100%"
                height="30vh"
                className="video-My"
                url={myStream}
              />
            </>
          )}
          {remoteStream && (
            <>
              <div>
                {/* Display name associated with the remote user's camera stream */}
              </div>
              <ReactPlayer
                playing
                muted
                width="100%"
                height="30vh"
                className="video-My"
                url={remoteStream}
              />
            </>
          )}
          {/* Display shared screen if screen sharing is active */}
          {showScreenShare && screenStream && (
            <>
              <div>{/* Display name associated with the shared screen */}</div>
              <ReactPlayer
                playing
                muted
                width="100%"
                height="30vh"
                className="video-My"
                url={screenStream}
              />
            </>
          )}
        </div>

        {myStream && (
          <button className="button-End" onClick={handleEndUser}>
            End Call
          </button>
        )}
      </div>

      <div className="chat-container">
        <h1>Chat App</h1>
        <div id="messages"></div>
        <div className="footer">
          <input
            type="text"
            className="put"
            width="100%"
            height="60px"
            placeholder="Message..."
          />
          {remoteSocketId ? (
            <button id="btn" onClick={handleable}>
              Send
            </button>
          ) : (
            <button id="btn" disabled>
              Send
            </button>
          )}
        </div>
      </div>
      <button className="dis-btn" onClick={handleRoomDisconnect}>
        Exit
      </button>
    </div>
  );
};

export default RoomPage;
