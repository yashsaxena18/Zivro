// client/src/components/StartChat.jsx
import { useState, useEffect } from "react";
import {
  Users,
  Globe,
  Sparkles,
  MessageCircle,
  Shield,
  Zap,
  ArrowRight,
  Star,
  Moon,
  Sun,
} from "lucide-react";

// Import your logo
import ZivroLogo from "../assets/ZivroLogo.png";

function StartChat({ onStart }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (name.trim().length > 20) {
      setError("Name must be less than 20 characters");
      return;
    }

    if (!gender) {
      setError("Please select your gender");
      return;
    }

    if (!region.trim()) {
      setError("Please enter your region");
      return;
    }

    onStart({
      name: name.trim(),
      gender: gender,
      region: region.trim(),
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 dark:from-gray-950 dark:via-gray-900 dark:to-black transition-all duration-500 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-44 sm:w-80 h-44 sm:h-80 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center animate-float">
            <img
              src={ZivroLogo}
              alt="ZIVRO Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white dark:text-gray-100 animate-fade-in">
            ZIVRO
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 sm:p-2.5 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-spin-slow" />
            ) : (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
            )}
          </button>

          <div className="hidden md:flex gap-8 text-white/80 dark:text-gray-300 font-medium">
            <a
              href="#features"
              className="hover:text-white dark:hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how"
              className="hover:text-white dark:hover:text-white transition-colors"
            >
              How it Works
            </a>
            <a
              href="#safety"
              className="hover:text-white dark:hover:text-white transition-colors"
            >
              Safety
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <div className="text-white dark:text-gray-100 space-y-4 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full animate-fade-in">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium">
                Talk to a new friend every day!
              </span>
            </div>

            <h1 className="text-2xl sm:text-5xl md:text-5xl font-bold leading-tight animate-slide-up">
              Connect with
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                Strangers
              </span>
              Worldwide
            </h1>

            <p className="text-base sm:text-xl text-purple-200 dark:text-gray-300 leading-relaxed animate-slide-up">
              Experience authentic conversations with people from around the
              globe. Safe, anonymous, and always exciting.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-4 animate-slide-up">
              <div
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-full text-xs sm:text-sm hover:scale-105 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                <span>100% Anonymous</span>
              </div>
              <div
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-full text-xs sm:text-sm hover:scale-105 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span>Instant Matching</span>
              </div>
              <div
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-full text-xs sm:text-sm hover:scale-105 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <span>Global Community</span>
              </div>
            </div>
          </div>

          {/* Right Form - REMOVED BORDER */}
          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl animate-fade-in-scale">
            <h2 className="text-xl sm:text-2xl font-bold text-white dark:text-gray-100 mb-1 sm:mb-2">
              Start Your Journey
            </h2>
            <p className="text-purple-200/80 dark:text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
              Fill in all details to connect with strangers worldwide
            </p>

            {/* Error message display */}
            {error && (
              <div className="mb-4 p-2.5 sm:p-3 bg-red-500/20 dark:bg-red-500/30 rounded-xl text-red-200 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              {/* Name Input - NO BORDER */}
              <div
                className="space-y-1.5 sm:space-y-2 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <label className="block text-xs sm:text-sm font-medium text-purple-200 dark:text-gray-300">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  maxLength={20}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/5 dark:bg-white/5 rounded-2xl text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-0 focus:outline-none focus:ring-0 focus:bg-white/10 dark:focus:bg-white/10 transition-all duration-300 text-sm sm:text-base"
                />
              </div>

              {/* Gender Selection - NO BORDER */}
              <div
                className="space-y-1.5 sm:space-y-2 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <label className="block text-xs sm:text-sm font-medium text-purple-200 dark:text-gray-300">
                  Your Gender <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`py-3 sm:py-4 px-2 sm:px-3 rounded-2xl font-medium transition-all duration-300 text-xs sm:text-base border-0 ${
                      gender === "male"
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50 scale-105"
                        : "bg-white/5 dark:bg-white/5 text-gray-300 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/10"
                    }`}
                  >
                    Male
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`py-3 sm:py-4 px-2 sm:px-3 rounded-2xl font-medium transition-all duration-300 text-xs sm:text-base border-0 ${
                      gender === "female"
                        ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/50 scale-105"
                        : "bg-white/5 dark:bg-white/5 text-gray-300 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/10"
                    }`}
                  >
                    Female
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("other")}
                    className={`py-3 sm:py-4 px-2 sm:px-3 rounded-2xl font-medium transition-all duration-300 text-xs sm:text-base border-0 ${
                      gender === "other"
                        ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/50 scale-105"
                        : "bg-white/5 dark:bg-white/5 text-gray-300 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/10"
                    }`}
                  >
                    Other
                  </button>
                </div>
              </div>

              {/* Region Input - NO BORDER */}
              <div
                className="space-y-1.5 sm:space-y-2 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <label className="block text-xs sm:text-sm font-medium text-purple-200 dark:text-gray-300">
                  Region <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="e.g., India, USA, UK"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 bg-white/5 dark:bg-white/5 rounded-2xl text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-0 focus:outline-none focus:ring-0 focus:bg-white/10 dark:focus:bg-white/10 transition-all duration-300 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 dark:from-purple-600 dark:via-pink-600 dark:to-purple-600 text-white font-bold py-4 sm:py-5 px-6 rounded-2xl shadow-2xl shadow-purple-500/50 dark:shadow-purple-600/50 hover:shadow-pink-500/50 dark:hover:shadow-pink-600/50 transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base animate-fade-in-up border-0"
                style={{ animationDelay: "0.4s" }}
                disabled={!name.trim() || !gender || !region.trim()}
              >
                <Users className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                Start Chatting Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-center text-xs sm:text-sm text-purple-200/60 dark:text-gray-500 mt-4 sm:mt-6">
              By continuing, you agree to our community guidelines
            </p>
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div
        id="how"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      >
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-4">
            How ZIVRO Works
          </h2>
          <p className="text-base sm:text-xl text-purple-200 dark:text-gray-300">
            Three simple steps to start meaningful conversations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="relative group">
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-8 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 h-full hover:scale-105 border-0">
              <div className="absolute -top-4 sm:-top-6 left-6 sm:left-8 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                1
              </div>
              <div className="mt-6 sm:mt-8 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 dark:text-purple-300" />
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-4">
                Create Your Profile
              </h3>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400 leading-relaxed">
                Enter your name, select your gender, and add your region. All
                fields are required to ensure authentic connections.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-8 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 h-full hover:scale-105 border-0">
              <div className="absolute -top-4 sm:-top-6 left-6 sm:left-8 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                2
              </div>
              <div className="mt-6 sm:mt-8 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 dark:text-blue-300" />
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-4">
                Get Instantly Matched
              </h3>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400 leading-relaxed">
                Our smart algorithm connects you with someone random from
                anywhere in the world in seconds. No waiting required!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-8 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 h-full hover:scale-105 border-0">
              <div className="absolute -top-4 sm:-top-6 left-6 sm:left-8 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                3
              </div>
              <div className="mt-6 sm:mt-8 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500/20 to-rose-500/20 dark:from-pink-500/10 dark:to-rose-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 dark:text-pink-300" />
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-4">
                Start Chatting
              </h3>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400 leading-relaxed">
                Have fun conversations, share experiences, and make new friends.
                Skip to next person anytime you want!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-10 sm:mt-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 backdrop-blur-xl rounded-3xl p-5 sm:p-8 border-0">
          <h3 className="text-xl sm:text-2xl font-bold text-white dark:text-gray-100 mb-4 sm:mb-6 text-center">
            💡 Pro Tips for Better Conversations
          </h3>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-2 h-2 bg-purple-400 dark:bg-purple-300 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
                <span className="font-semibold text-white dark:text-gray-200">
                  Be Respectful:
                </span>{" "}
                Treat everyone with kindness and respect, just as you would in
                person
              </p>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-2 h-2 bg-pink-400 dark:bg-pink-300 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
                <span className="font-semibold text-white dark:text-gray-200">
                  Stay Safe:
                </span>{" "}
                Never share personal information like phone numbers or addresses
              </p>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
                <span className="font-semibold text-white dark:text-gray-200">
                  Be Interesting:
                </span>{" "}
                Ask questions and share stories to keep the conversation flowing
              </p>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-2 h-2 bg-cyan-400 dark:bg-cyan-300 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
                <span className="font-semibold text-white dark:text-gray-200">
                  Have Fun:
                </span>{" "}
                Enjoy meeting new people from different cultures and backgrounds
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white dark:text-gray-100 text-center mb-10 sm:mb-16">
          Why Choose ZIVRO?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-8 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 group hover:scale-105 border-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-4">
              Instant Connections
            </h3>
            <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
              Get matched with someone new in seconds. No waiting, no hassle,
              just pure conversation.
            </p>
          </div>

          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-8 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 group hover:scale-105 border-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-4">
              Safe & Secure
            </h3>
            <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
              Your privacy is our priority. Chat anonymously with built-in
              safety features and moderation.
            </p>
          </div>

          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-8 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 group hover:scale-105 border-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-4">
              Global Reach
            </h3>
            <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
              Connect with people from every corner of the world. Experience
              diverse cultures and perspectives.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Section */}
      <div
        id="safety"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      >
        <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 dark:from-green-500/5 dark:to-blue-500/5 backdrop-blur-xl rounded-3xl p-6 sm:p-12 border-0">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mb-4 sm:mb-6 animate-pulse">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-4">
              Your Safety Matters
            </h2>
            <p className="text-base sm:text-xl text-purple-200 dark:text-gray-300 max-w-2xl mx-auto">
              We've built ZIVRO with your security and comfort in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 border-0">
              <h3 className="text-base sm:text-xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-green-400 dark:bg-green-300 rounded-full"></div>
                Complete Anonymity
              </h3>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
                Your real identity stays hidden. Only share what you're
                comfortable with.
              </p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 border-0">
              <h3 className="text-base sm:text-xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full"></div>
                Easy Skip Option
              </h3>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
                Not feeling the vibe? Skip to the next person instantly with one
                click.
              </p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 border-0">
              <h3 className="text-base sm:text-xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-300 rounded-full"></div>
                Report & Block
              </h3>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
                Encounter inappropriate behavior? Report users to help keep our
                community safe.
              </p>
            </div>

            <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 border-0">
              <h3 className="text-base sm:text-xl font-bold text-white dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-pink-400 dark:bg-pink-300 rounded-full"></div>
                No Data Storage
              </h3>
              <p className="text-sm sm:text-base text-purple-200 dark:text-gray-400">
                Conversations aren't stored. Chat freely knowing your messages
                disappear after.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 dark:bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                  <img
                    src={ZivroLogo}
                    alt="ZIVRO Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white dark:text-gray-100">
                  ZIVRO
                </span>
              </div>
              <p className="text-purple-200 dark:text-gray-400 text-xs sm:text-sm">
                Connecting the world, one conversation at a time.
              </p>
            </div>

            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Product
              </h4>
              <div className="space-y-1.5 sm:space-y-2 text-purple-200 dark:text-gray-400 text-xs sm:text-sm">
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Features
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  How it Works
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Safety
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Pricing
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Company
              </h4>
              <div className="space-y-1.5 sm:space-y-2 text-purple-200 dark:text-gray-400 text-xs sm:text-sm">
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  About Us
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Careers
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Blog
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Contact
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Legal
              </h4>
              <div className="space-y-1.5 sm:space-y-2 text-purple-200 dark:text-gray-400 text-xs sm:text-sm">
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Privacy Policy
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Terms of Service
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Guidelines
                </div>
                <div className="hover:text-white dark:hover:text-gray-200 transition-colors cursor-pointer">
                  Cookies
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 dark:border-white/5 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-purple-200 dark:text-gray-500 text-xs sm:text-sm">
            ZIVRO. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default StartChat;
