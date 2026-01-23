import { useEffect, useRef, useState } from "react";
import { Camera, Mic, AlertTriangle } from "lucide-react";

function MediaPermissionModal({ onAllow, onCancel }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================
  // REQUEST CAMERA + MIC
  // =====================================
  useEffect(() => {
    let active = true;

    async function requestMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) return;

        setStream(mediaStream);
        setLoading(false);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("❌ Media permission denied:", err);
        setError(
          "Camera or microphone access denied. Please allow access to continue."
        );
        setLoading(false);
      }
    }

    requestMedia();

    return () => {
      active = false;
    };
  }, []);

  // =====================================
  // CLEANUP STREAM
  // =====================================
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // =====================================
  // HANDLERS
  // =====================================
  const handleContinue = () => {
    if (!stream) return;
    onAllow(stream);
  };

  const handleCancel = () => {
    stopStream();
    onCancel();
  };

  // =====================================
  // UI
  // =====================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 px-4 sm:px-6">
      {/* Animated background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 transform transition-all">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-3 shadow-lg shadow-purple-500/30">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Enable Camera & Microphone
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto leading-relaxed">
            We need access to your camera and mic to start the video chat experience
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 backdrop-blur-sm">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* VIDEO PREVIEW */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 mb-6 shadow-xl border border-white/5">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/50 backdrop-blur-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200"></div>
              </div>
              <p className="text-gray-400 text-sm font-medium">Requesting camera access...</p>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Video overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Cancel
          </button>

          <button
            onClick={handleContinue}
            disabled={!stream || error}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
          Your privacy matters. We never record or store your video without permission.
        </p>
      </div>
    </div>
  );
}

export default MediaPermissionModal;