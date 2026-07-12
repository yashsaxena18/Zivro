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
    const handleChatMessage = ({ from, message, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        { from, message, timestamp },
      ]);
      
      // Increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handlePartnerLeft = () => {
      setMessages([]);
      setChatInput("");
      setUnreadCount(0);
    };

    socket.on("chat-message", handleChatMessage);
    socket.on("partner-left", handlePartnerLeft);

    return () => {
      socket.off("chat-message", handleChatMessage);
      socket.off("partner-left", handlePartnerLeft);
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
  // MAIN UI (FULL SCREEN IMMERSIVE)
  // ===================================================
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex">
      {/* LEFT/MAIN: VIDEO AREA */}
      <div
        className={`relative h-full transition-all duration-300 ease-in-out ${
          isChatOpen ? "w-full md:w-[calc(100%-24rem)]" : "w-full"
        }`}
      >
        {/* REMOTE VIDEO FULL SCREEN */}
        <div className="absolute inset-0 bg-gray-900">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Connection overlay */}
          {!remoteConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium">Connecting to {partnerName || "stranger"}...</p>
            </div>
          )}
        </div>

        {/* HEADER OVERLAY */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 pb-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-between items-start pointer-events-auto">
            <div className="flex items-center gap-2 md:gap-3 bg-black/50 backdrop-blur-lg rounded-full px-4 md:px-5 py-2 md:py-2.5 border border-white/10 shadow-lg">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="text-sm md:text-base font-medium">
                <span className="hidden md:inline text-gray-300">Connected to </span>
                <strong className="text-white">{partnerName || "Stranger"}</strong>
              </span>
            </div>

            <div className="bg-black/50 backdrop-blur-lg rounded-full px-3 md:px-4 py-2 border border-white/10 text-xs md:text-sm font-medium shadow-lg">
              {remoteConnected ? "🟢 Connected" : "🟡 Connecting..."}
            </div>
          </div>
        </div>

        {/* LOCAL VIDEO PIP */}
        <div className="absolute bottom-28 right-4 md:bottom-32 md:right-8 w-28 h-40 md:w-48 md:h-64 lg:w-56 lg:h-72 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-gray-900 transition-all hover:scale-105">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {/* Local video label */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
            You
          </div>
          {/* Muted indicators on local video */}
          {!localVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <VideoOff className="w-8 h-8 md:w-10 md:h-10 text-white/80" />
            </div>
          )}
        </div>

        {/* CONTROLS OVERLAY */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-8 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-black/50 backdrop-blur-xl rounded-full border border-white/10 p-2 md:p-3 flex gap-2 md:gap-4 shadow-2xl">
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${
                localVideoEnabled
                  ? "bg-gray-700/80 hover:bg-gray-600"
                  : "bg-red-500 hover:bg-red-600"
              } flex items-center justify-center transition-all hover:scale-105`}
              title={localVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {localVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={toggleAudio}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${
                localAudioEnabled
                  ? "bg-gray-700/80 hover:bg-gray-600"
                  : "bg-red-500 hover:bg-red-600"
              } flex items-center justify-center transition-all hover:scale-105`}
              title={localAudioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {localAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={handleEndCall}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all hover:scale-110 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
              title="End call"
            >
              <Phone className="rotate-[135deg]" size={24} />
            </button>

            <button
              onClick={handleNext}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all hover:scale-110 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              title="Next user"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={toggleChat}
              className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full ${
                isChatOpen ? "bg-blue-600" : "bg-gray-700/80 hover:bg-gray-600"
              } flex items-center justify-center transition-all hover:scale-105`}
              title="Toggle chat"
            >
              <MessageCircle size={20} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: SLIDING CHAT PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-gray-900 border-l border-white/10 z-30 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">Chat</h3>
            </div>
            <button
              onClick={toggleChat}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
                <MessageCircle className="w-12 h-12 text-gray-700" />
                <p>No messages yet. Say hi!</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.from === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.from === "me"
                        ? "bg-blue-600 text-white rounded-br-sm shadow-md"
                        : "bg-gray-800 text-gray-100 rounded-bl-sm border border-white/5 shadow-md"
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
          <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-5 py-3.5 rounded-full bg-gray-800 border border-white/10 outline-none focus:border-blue-500 focus:bg-gray-700 transition-all text-sm shadow-inner"
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim()}
                className="w-12 h-12 shrink-0 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center transition-all disabled:scale-100 hover:scale-105 shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoChat;