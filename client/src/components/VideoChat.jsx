// client/src/components/VideoChat.jsx
import { useEffect, useRef, useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  SkipForward,
  Users,
  AlertCircle,
} from "lucide-react";

import { onSignal, nextUser } from "../socket/socket";
import { createPeer, handleSignal, closePeer } from "../webrtc/peer";

function VideoChat({
  roomId,
  partnerId,
  partnerName,
  isInitiator,
  localStream,
  onExit,
  onNext,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [error, setError] = useState(null);

  // ===================================================
  // PEER INITIALIZATION (NO getUserMedia HERE ❗)
  // ===================================================
  useEffect(() => {
    if (!localStream || !partnerId) return;

    // Attach local preview
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    createPeer({
      stream: localStream,
      roomId,
      partnerId,
      isInitiator,
      onRemoteStream: (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          setRemoteConnected(true);
        }
      },
      onConnectionStateChange: (state) => {
        setRemoteConnected(state === "connected");
      },
    });

    const cleanupSignal = onSignal(handleSignal);

    return () => {
      cleanupSignal?.();
      closePeer(partnerId);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [partnerId, isInitiator, localStream, roomId]);

  // ===================================================
  // MEDIA CONTROLS
  // ===================================================
  const toggleVideo = () => {
    const track = localStream?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setLocalVideoEnabled(track.enabled);
  };

  const toggleAudio = () => {
    const track = localStream?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setLocalAudioEnabled(track.enabled);
  };

  // ===================================================
  // ACTIONS
  // ===================================================
  const handleEndCall = () => {
    closePeer(partnerId);
    onExit();
  };

  const handleNext = () => {
    closePeer(partnerId);
    nextUser();
    onNext();
  };

  // ===================================================
  // ERROR UI
  // ===================================================
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p>{error}</p>
          <button
            onClick={onExit}
            className="mt-6 px-6 py-2 bg-red-500 rounded-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN UI (YOUR PREMIUM DESIGN)
  // ===================================================
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-lg rounded-full px-6 py-3 border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-medium">
              Connected to{" "}
              <span className="font-semibold">
                {partnerName || "Stranger"}
              </span>
            </span>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-full px-4 py-2 border border-white/10 text-sm">
            {remoteConnected ? "🟢 Connected" : "🟡 Connecting..."}
          </div>
        </div>
      </div>

      {/* VIDEOS */}
      <div className="h-full w-full pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* REMOTE */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gray-800">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* LOCAL */}
          <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 bg-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <div className="bg-black/60 backdrop-blur-xl rounded-full border border-white/10 p-4 flex gap-4">
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              localVideoEnabled ? "bg-gray-700" : "bg-red-500"
            }`}
          >
            {localVideoEnabled ? <Video /> : <VideoOff />}
          </button>

          <button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              localAudioEnabled ? "bg-gray-700" : "bg-red-500"
            }`}
          >
            {localAudioEnabled ? <Mic /> : <MicOff />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
          >
            <Phone className="rotate-[135deg]" />
          </button>

          <button
            onClick={handleNext}
            className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <SkipForward />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoChat;
