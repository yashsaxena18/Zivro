import { sendSignal } from "../socket/socket";

// =======================================================
// INTERNAL STATE
// =======================================================
const peerConnections = new Map(); // partnerId → RTCPeerConnection
const pendingCandidates = new Map(); // partnerId → RTCIceCandidate[]

// =======================================================
// ICE SERVERS (STUN + FREE TURN)
// =======================================================
const ICE_SERVERS = {
  iceServers: [
    // STUN
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },

    // TURN (Metered / OpenRelay — OK for testing)
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

// =======================================================
// CREATE PEER CONNECTION
// =======================================================
export function createPeer({
  stream,
  partnerId,
  isInitiator,
  onRemoteStream,
  onConnectionStateChange,
}) {
  // 🔒 Prevent duplicate peers
  if (peerConnections.has(partnerId)) {
    return;
  }

  const pc = new RTCPeerConnection(ICE_SERVERS);
  peerConnections.set(partnerId, pc);

  // ===============================
  // ADD LOCAL TRACKS
  // ===============================
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
  });

  // ===============================
  // REMOTE STREAM
  // ===============================
  pc.ontrack = (event) => {
    const [remoteStream] = event.streams;
    if (remoteStream) {
      onRemoteStream?.(remoteStream);
    }
  };

  // ===============================
  // ICE CANDIDATES
  // ===============================
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal(partnerId, {
        type: "ice-candidate",
        candidate: event.candidate,
      });
    }
  };

  // ===============================
  // CONNECTION STATE
  // ===============================
  pc.onconnectionstatechange = () => {
    const state = pc.connectionState;
    onConnectionStateChange?.(state);

    if (state === "failed" || state === "closed") {
      closePeer(partnerId);
    }
  };

  // ===============================
  // OFFER (INITIATOR ONLY)
  // ===============================
  if (isInitiator) {
    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        sendSignal(partnerId, {
          type: "offer",
          sdp: offer,
        });
      } catch {
        // Ignore offer creation failures silently.
      }
    };
  }
}

// =======================================================
// HANDLE SIGNALS
// =======================================================
export async function handleSignal({ from, data }) {
  const pc = peerConnections.get(from);
  if (!pc) {
    return;
  }

  try {
    switch (data.type) {
      case "offer": {
        await pc.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );

        flushPendingCandidates(from, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendSignal(from, {
          type: "answer",
          sdp: answer,
        });
        break;
      }

      case "answer": {
        await pc.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );

        flushPendingCandidates(from, pc);
        break;
      }

      case "ice-candidate": {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } else {
          const queue = pendingCandidates.get(from) || [];
          queue.push(data.candidate);
          pendingCandidates.set(from, queue);
        }
        break;
      }

      default:
        break;
    }
  } catch {
    // Ignore signal handling failures silently.
  }
}

// =======================================================
// FLUSH ICE CANDIDATES
// =======================================================
function flushPendingCandidates(partnerId, pc) {
  const queued = pendingCandidates.get(partnerId);
  if (!queued) return;

  queued.forEach((c) => {
    pc.addIceCandidate(new RTCIceCandidate(c));
  });

  pendingCandidates.delete(partnerId);
}

// =======================================================
// CLOSE PEER
// =======================================================
export function closePeer(partnerId) {
  const pc = peerConnections.get(partnerId);
  if (!pc) return;

  try {
    pc.ontrack = null;
    pc.onicecandidate = null;
    pc.onconnectionstatechange = null;

    pc.getSenders().forEach((sender) => {
      try {
        pc.removeTrack(sender);
      } catch {
        // Ignore errors when removing tracks
      }
    });

    pc.close();
  } catch {
    // Ignore close errors silently.
  }

  peerConnections.delete(partnerId);
  pendingCandidates.delete(partnerId);
}

// =======================================================
// DEBUG / MONITORING
// =======================================================
export function getPeerStats() {
  return {
    activePeers: peerConnections.size,
    peers: Array.from(peerConnections.keys()),
  };
}
