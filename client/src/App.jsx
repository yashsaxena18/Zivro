// client/src/App.jsx
import { useEffect, useState } from "react";
import {
  connectSocket,
  disconnectSocket,
  joinQueue,
  leaveQueue,
  onMatched,
  onPartnerLeft,
  onConnectionError,
  onDisconnect,
  onConnectGlobal,
} from "./socket/socket";

import StartChat from "./components/StartChat";
import VideoChat from "./components/VideoChat";
import Loader from "./components/Loader";

import MediaPermissionModal from "./components/MediaPermissionModal";
import TermsModal from "./components/TermsModal";

function App() {
  /**
   * idle        → landing page
   * permissions → camera + mic modal
   * terms       → terms & conditions
   * queue       → waiting for match
   * chat        → video chat
   */
  const [status, setStatus] = useState("idle");

  const [roomId, setRoomId] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [partnerName, setPartnerName] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [error, setError] = useState(null);
  const [serverReady, setServerReady] = useState(false);

  const [userData, setUserData] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);

  // ===================================================
  // RESET EVERYTHING → HOME
  // ===================================================
  const resetToHome = () => {
    setRoomId(null);
    setPartnerId(null);
    setPartnerName(null);
    setIsInitiator(false);
    setUserData(null);

    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
    }

    setStatus("idle");
    setError(null);
  };

  // ===================================================
  // SOCKET LIFECYCLE (RUN ONCE)
  // ===================================================
  useEffect(() => {
    setError("⏳ Server is waking up, please wait a moment...");
    connectSocket()
      .then(() => {
        setServerReady(true);
        setError(null);
      })
      .catch(() => {
        setError("Could not reach server. Please refresh and try again.");
      });

    const cleanupMatched = onMatched((data) => {
      setRoomId(data.roomId);
      setPartnerId(data.partnerId);
      setPartnerName(data.partnerName || "Stranger");
      setIsInitiator(data.isInitiator);
      setStatus("chat");
    });

    const cleanupPartnerLeft = onPartnerLeft(() => {
      setRoomId(null);
      setPartnerId(null);
      setPartnerName(null);
      setIsInitiator(false);
      setStatus("queue");
    });

    const cleanupError = onConnectionError(() => {
      setServerReady(false);
      setError("⏳ Reconnecting to server, please wait...");
    });

    const cleanupDisconnect = onDisconnect((reason) => {
      resetToHome();
    });

    const cleanupConnect = onConnectGlobal(() => {
      setServerReady(true);
      setError(null);
    });

    return () => {
      cleanupMatched?.();
      cleanupPartnerLeft?.();
      cleanupError?.();
      cleanupDisconnect?.();
      cleanupConnect?.();
      disconnectSocket();
    };
  }, []); // ✅ DO NOT add mediaStream here

  // ===================================================
  // FLOW HANDLERS
  // ===================================================

  // STEP 1 → from StartChat
  const handleStart = (data) => {
    setUserData(data);
    setStatus("permissions");
  };

  // STEP 2 → camera + mic granted
  const handleMediaAllowed = (stream) => {
    setMediaStream(stream);
    setStatus("terms");
  };

  // STEP 3 → terms accepted → JOIN QUEUE
  const handleTermsAccepted = () => {
    if (!userData) return; // safety guard
    joinQueue(userData);
    setStatus("queue");
  };

  // CANCEL QUEUE
  const handleCancelQueue = () => {
    leaveQueue();
    resetToHome();
  };

  // EXIT CHAT → HOME
  const handleExitVideoChat = () => {
    leaveQueue();
    resetToHome();
  };

  // NEXT USER → QUEUE
  const handleNextVideoChat = () => {
    setRoomId(null);
    setPartnerId(null);
    setPartnerName(null);
    setIsInitiator(false);
    setStatus("queue");
  };

  // ===================================================
  // UI
  // ===================================================
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {error && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white px-6 py-3 rounded-xl ${
          serverReady ? 'bg-red-500' : 'bg-amber-500/90 backdrop-blur-sm'
        }`}>
          {error}
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center">
        {status === "idle" && <StartChat onStart={handleStart} disabled={!serverReady} />}

        {status === "permissions" && (
          <MediaPermissionModal
            onAllow={handleMediaAllowed}
            onCancel={resetToHome}
          />
        )}

        {status === "terms" && (
          <TermsModal
            onAccept={handleTermsAccepted}
            onCancel={resetToHome}
          />
        )}

        {status === "queue" && (
          <Loader onCancel={handleCancelQueue} />
        )}

        {status === "chat" && (
          <VideoChat
            key={roomId}
            roomId={roomId}
            partnerId={partnerId}
            partnerName={partnerName}
            isInitiator={isInitiator}
            localStream={mediaStream}
            onExit={handleExitVideoChat}
            onNext={handleNextVideoChat}
          />
        )}
      </div>
    </div>
  );
}

export default App;
