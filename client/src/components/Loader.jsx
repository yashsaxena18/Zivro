import { useEffect, useState, useMemo } from "react";
import { Video, Users, X } from "lucide-react";
import ZivroLogo from "../assets/ZivroLogo.png";

function Loader({ onCancel }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorParticles, setCursorParticles] = useState([]);

  const messages = [
    "Finding strangers nearby...",
    "Connecting you to the world...",
    "Almost there...",
    "Preparing your chat room...",
    "Looking for the perfect match...",
  ];

  // Generate random values once during initialization
  const randomOrbsLarge = useMemo(
    () =>
      [...Array(15)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: 60 + Math.random() * 100,
        height: 60 + Math.random() * 100,
        duration: 20 + Math.random() * 15,
        delay: Math.random() * 5,
        colorIndex: Math.floor(Math.random() * 3),
      })),
    []
  );

  const randomParticlesMd = useMemo(
    () =>
      [...Array(50)].map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: 2 + Math.random() * 4,
        height: 2 + Math.random() * 4,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 4,
        isEven: i % 2 === 0,
      })),
    []
  );

  const randomStardust = useMemo(
    () =>
      [...Array(100)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.8,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 3,
      })),
    []
  );

  const randomConnections = useMemo(
    () =>
      [...Array(12)].map((_, i) => ({
        x1: 10 + i * 8,
        y1: 20 + i * 6,
        x2: 90 - i * 7,
        y2: 80 - i * 5,
        duration: 4 + i * 0.3,
        delay1: i * 0.4,
        delay2: i * 0.3,
        delay3: i * 0.3 + 0.5,
      })),
    []
  );

  const randomWaves = useMemo(
    () =>
      [...Array(5)].map((_, i) => ({
        top: i * 25,
        duration: 8 + i * 2,
        delay: i * 0.5,
      })),
    []
  );

  const randomSparkles = useMemo(
    () =>
      [...Array(4)].map((_, i) => ({
        isTop: i % 2 === 0,
        isLeft: i < 2,
        delay: i * 0.3,
      })),
    []
  );

  const randomLoadingDots = useMemo(
    () => [0, 0.2, 0.4].map((delay, i) => ({ delay, index: i })),
    []
  );

  const randomConnectingDots = useMemo(
    () => [0, 0.2, 0.4].map((delay) => ({ delay })),
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  // Track mouse movement
  useEffect(() => {
    let particleCounter = 0;
    
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Generate random values inside the event handler (not during render)
      const randomValue = Math.random();
      const randomSize = Math.random();
      const randomSpeedX = Math.random();
      const randomSpeedY = Math.random();
      
      const newParticle = {
        id: Date.now() + particleCounter++,
        x: e.clientX,
        y: e.clientY,
        size: 4 + randomSize * 8,
        color:
          randomValue > 0.5
            ? "purple"
            : randomValue > 0.25
            ? "pink"
            : "blue",
        speedX: (randomSpeedX - 0.5) * 4,
        speedY: (randomSpeedY - 0.5) * 4,
      };

      setCursorParticles((prev) => [...prev, newParticle].slice(-30));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate and remove cursor particles
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorParticles((prev) =>
        prev.filter((p) => Date.now() - p.id < 1000)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Enhanced Animated Particles Background */}
      <div className="absolute inset-0">
        {/* Floating Orbs - Large */}
        {randomOrbsLarge.map((orb, i) => (
          <div
            key={`orb-lg-${i}`}
            className="absolute rounded-full blur-xl"
            style={{
              left: `${orb.left}%`,
              top: `${orb.top}%`,
              width: `${orb.width}px`,
              height: `${orb.height}px`,
              background: `radial-gradient(circle, ${
                orb.colorIndex === 0
                  ? "rgba(139, 92, 246, 0.3)"
                  : orb.colorIndex === 1
                  ? "rgba(236, 72, 153, 0.3)"
                  : "rgba(59, 130, 246, 0.3)"
              }, transparent)`,
              animation: `floatSlow ${orb.duration}s ease-in-out infinite`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}

        {/* Glowing Particles - Medium */}
        {randomParticlesMd.map((particle, i) => (
          <div
            key={`particle-md-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              background: particle.isEven
                ? "rgba(167, 139, 250, 0.6)"
                : "rgba(244, 114, 182, 0.6)",
              boxShadow: `0 0 ${10 + (particle.width - 2) * 5}px ${
                particle.isEven
                  ? "rgba(167, 139, 250, 0.8)"
                  : "rgba(244, 114, 182, 0.8)"
              }`,
              animation: `twinkleSlow ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}

        {/* Stardust - Small particles */}
        {randomStardust.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-px h-px bg-white rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {/* Connecting Dots Network */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <defs>
            <radialGradient id="dotGradient">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Animated connecting lines */}
          {randomConnections.map((conn, i) => (
            <g key={`connection-${i}`}>
              <line
                x1={`${conn.x1}%`}
                y1={`${conn.y1}%`}
                x2={`${conn.x2}%`}
                y2={`${conn.y2}%`}
                stroke="url(#dotGradient)"
                strokeWidth="0.5"
                style={{
                  animation: `pulseSlow ${conn.duration}s ease-in-out infinite`,
                  animationDelay: `${conn.delay1}s`,
                }}
              />
              <circle
                cx={`${conn.x1}%`}
                cy={`${conn.y1}%`}
                r="2"
                fill="#a78bfa"
                style={{
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  animationDelay: `${conn.delay2}s`,
                }}
              />
              <circle
                cx={`${conn.x2}%`}
                cy={`${conn.y2}%`}
                r="2"
                fill="#ec4899"
                style={{
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  animationDelay: `${conn.delay3}s`,
                }}
              />
            </g>
          ))}
        </svg>

        {/* Flowing Energy Waves */}
        <div className="absolute inset-0 overflow-hidden">
          {randomWaves.map((wave, i) => (
            <div
              key={`wave-${i}`}
              className="absolute w-full h-32 opacity-10"
              style={{
                top: `${wave.top}%`,
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(139, 92, 246, 0.5) 50%, 
                  transparent 100%)`,
                animation: `wave ${wave.duration}s ease-in-out infinite`,
                animationDelay: `${wave.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Cursor Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {cursorParticles.map((particle) => {
          const age = Date.now() - particle.id;
          const opacity = Math.max(0, 1 - age / 1000);
          const scale = 1 + age / 500;

          return (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: particle.x + particle.speedX * (age / 50),
                top: particle.y + particle.speedY * (age / 50),
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background:
                  particle.color === "purple"
                    ? "rgba(167, 139, 250, 0.8)"
                    : particle.color === "pink"
                    ? "rgba(244, 114, 182, 0.8)"
                    : "rgba(59, 130, 246, 0.8)",
                boxShadow: `0 0 ${particle.size * 3}px ${
                  particle.color === "purple"
                    ? "rgba(167, 139, 250, 0.6)"
                    : particle.color === "pink"
                    ? "rgba(244, 114, 182, 0.6)"
                    : "rgba(59, 130, 246, 0.6)"
                }`,
                opacity,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transition: "opacity 0.1s ease-out",
              }}
            />
          );
        })}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6">
        {/* Cancel Button - Top Right */}
        <button
          onClick={handleCancel}
          className="absolute top-6 right-6 group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-full p-3 transition-all duration-300 hover:scale-110"
          aria-label="Cancel"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
        </button>

        {/* ZIVRO Logo with Enhanced Animation */}
        <div
          className="mb-8 sm:mb-12"
          style={{ animation: "floatSlow 20s ease-in-out infinite" }}
        >
          <div className="relative">
            {/* Outer Glow Ring - Multiple Layers */}
            <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              <div
                className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-60"
                style={{ animation: "pulseSlow 3s ease-in-out infinite" }}
              ></div>
              <div
                className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-2xl opacity-40 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>

            {/* Logo Container with Rotating Border */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              {/* Rotating gradient border */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full"
                style={{ animation: "spinSlow 8s linear infinite" }}
              ></div>

              {/* Inner Circle */}
              <div className="absolute inset-1 bg-slate-900 rounded-full flex items-center justify-center p-2">
                {/* ZIVRO Logo */}
                <img 
                  src={ZivroLogo} 
                  alt="ZIVRO Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain animate-pulse"
                />

                {/* Sparkle effects around logo */}
                {randomSparkles.map((sparkle, i) => (
                  <div
                    key={`sparkle-${i}`}
                    className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                    style={{
                      top: sparkle.isTop ? "0" : "auto",
                      bottom: !sparkle.isTop ? "0" : "auto",
                      left: sparkle.isLeft ? "0" : "auto",
                      right: !sparkle.isLeft ? "0" : "auto",
                      animationDelay: `${sparkle.delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ZIVRO Text with Glow */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-wider relative">
          ZIVRO
          <div className="absolute inset-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent blur-sm opacity-50 animate-pulse">
            ZIVRO
          </div>
        </h1>

        {/* Loading Dots with Glow */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
          {randomLoadingDots.map((dot, i) => (
            <div
              key={i}
              className="relative w-3 h-3 sm:w-4 sm:h-4 animate-bounce"
              style={{ animationDelay: `${dot.delay}s` }}
            >
              <div
                className={`absolute inset-0 ${
                  dot.index === 0
                    ? "bg-purple-500"
                    : dot.index === 1
                    ? "bg-pink-500"
                    : "bg-blue-500"
                } rounded-full`}
              ></div>
              <div
                className={`absolute inset-0 ${
                  dot.index === 0
                    ? "bg-purple-500"
                    : dot.index === 1
                    ? "bg-pink-500"
                    : "bg-blue-500"
                } rounded-full blur-md opacity-60 animate-pulse`}
              ></div>
            </div>
          ))}
        </div>

        {/* Rotating Messages */}
        <div className="h-8 sm:h-10 flex items-center justify-center overflow-hidden">
          <p
            className="text-base sm:text-lg md:text-xl text-purple-200 font-medium text-center px-4"
            key={messageIndex}
          >
            {messages[messageIndex]}
          </p>
        </div>

        {/* Connecting Icon Animation */}
        <div className="mt-8 sm:mt-12 flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
          </div>

          <div className="flex gap-1">
            {randomConnectingDots.map((dot, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full"
                style={{
                  animation: "wave 1.5s ease-in-out infinite",
                  animationDelay: `${dot.delay}s`,
                }}
              />
            ))}
          </div>

          <Video
            className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Status Indicator */}
        <div className="mt-6 sm:mt-8 flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="relative">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="text-xs sm:text-sm text-purple-200">
            Online & Searching
          </span>
        </div>

        {/* Cancel Button Text - Bottom */}
        <button
          onClick={handleCancel}
          className="mt-8 text-sm text-purple-300/70 hover:text-purple-200 transition-colors duration-300 underline underline-offset-4 decoration-dotted"
        >
          Cancel and go back
        </button>
      </div>

      <style jsx>{`
        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-15px) translateX(5px);
          }
        }

        @keyframes twinkleSlow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default Loader;