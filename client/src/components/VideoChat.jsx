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
  Send,
  MessageCircle,
  X,
} from "lucide-react";

import { socket, onSignal, nextUser } from "../socket/socket";
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
  const messagesEndRef = useRef(null);

  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 CHAT STATE
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ===================================================
  // PEER INITIALIZATION
  // ===================================================
  useEffect(() => {
    if (!localStream || !partnerId) return;

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
  // CHAT LISTENERS
  // ===================================================
  useEffect(() => {
    socket.on("chat-message", ({ from, message, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        { from, message, timestamp },
      ]);
      
      // Increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("partner-left", () => {
      setMessages([]);
      setChatInput("");
      setUnreadCount(0);
    });

    return () => {
      socket.off("chat-message");
      socket.off("partner-left");
    };
  }, [isChatOpen]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset unread when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

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

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    socket.emit("chat-message", {
      message: chatInput,
    });

    setMessages((prev) => [
      ...prev,
      {
        from: "me",
        message: chatInput,
        timestamp: Date.now(),
      },
    ]);

    setChatInput("");
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // ===================================================
  // ERROR UI
  // ===================================================
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
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
  // MAIN UI
  // ===================================================
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3 bg-black/40 backdrop-blur-lg rounded-full px-4 md:px-6 py-2 md:py-3 border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            <span className="text-sm md:text-base">
              <span className="hidden md:inline">Connected to </span>
              <strong>{partnerName || "Stranger"}</strong>
            </span>
          </div>

          <div className="bg-black/40 rounded-full px-3 md:px-4 py-2 border border-white/10 text-xs md:text-sm">
            {remoteConnected ? "🟢 Connected" : "🟡 Connecting..."}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA - RESIZES WHEN CHAT IS OPEN */}
      <div className={`h-full transition-all duration-300 ease-in-out ${
        isChatOpen ? 'md:mr-96' : 'mr-0'
      }`}>
        {/* FULL SCREEN VIDEO AREA */}
        <div className="h-full w-full pt-16 md:pt-24 pb-28 md:pb-32">
          <div className="h-full w-full px-4 md:px-6">
            <div className="h-full max-w-7xl mx-auto relative">
              {/* REMOTE VIDEO - MAIN */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-gray-900">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Connection overlay when not connected */}
                {!remoteConnected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg">Connecting to {partnerName || "stranger"}...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* LOCAL VIDEO - PICTURE IN PICTURE */}
              <div className="absolute bottom-4 right-4 w-32 h-24 md:w-48 md:h-36 lg:w-64 lg:h-48 rounded-2xl overflow-hidden border-2 border-blue-500/50 bg-gray-800 shadow-2xl z-10">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Local video label */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                  You
                </div>
                
                {/* Muted indicators on local video */}
                {!localVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <VideoOff className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDING CHAT PANEL - OVERLAYS ON MOBILE, SIDE-BY-SIDE ON DESKTOP */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 z-30 transform transition-transform duration-300 ease-in-out ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Chat</h3>
            </div>
            <button
              onClick={toggleChat}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      m.from === "me"
                        ? "bg-blue-600 rounded-br-sm"
                        : "bg-gray-700 rounded-bl-sm"
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-full bg-gray-800 border border-white/10 outline-none focus:border-blue-500 transition-colors text-sm"
              />
              <button
                onClick={sendMessage}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-4 md:bottom-6 left-0 right-0 z-20 flex justify-center px-4">
        <div className="bg-black/60 backdrop-blur-xl rounded-full border border-white/10 p-3 md:p-4 flex gap-2 md:gap-4">
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${
              localVideoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
            } flex items-center justify-center transition-colors`}
            title={localVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {localVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={toggleAudio}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${
              localAudioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
            } flex items-center justify-center transition-colors`}
            title={localAudioEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {localAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
            title="End call"
          >
            <Phone className="rotate-[135deg]" size={22} />
          </button>

          <button
            onClick={handleNext}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
            title="Next user"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={toggleChat}
            className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            title="Toggle chat"
          >
            <MessageCircle size={20} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoChat;