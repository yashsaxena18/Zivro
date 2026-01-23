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
    connectSocket().catch(() => {
      setError("Failed to connect to server. Please refresh.");
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
      setError("Connection lost. Reconnecting...");
    });

    const cleanupDisconnect = onDisconnect((reason) => {
      if (reason === "io server disconnect") {
        resetToHome();
      }
    });

    return () => {
      cleanupMatched?.();
      cleanupPartnerLeft?.();
      cleanupError?.();
      cleanupDisconnect?.();
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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center">
        {status === "idle" && <StartChat onStart={handleStart} />}

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
