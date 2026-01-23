import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";

function TermsModal({ onAccept, onCancel }) {
  const [accepted, setAccepted] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-green-950/40 to-slate-950 px-4 sm:px-6">
      {/* Animated background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 transform transition-all">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 shadow-lg shadow-green-500/20">
            <ShieldCheck className="w-7 h-7 text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Terms & Community Guidelines
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Required for access</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-5 leading-relaxed">
          Please review and accept our terms before continuing to ensure a safe and respectful community.
        </p>

        {/* Dropdown */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/10 transition-all duration-200 group"
        >
          <span className="font-semibold text-white text-sm sm:text-base">View Terms & Conditions</span>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
            <ChevronDown
              className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Content */}
        {open && (
          <div className="mt-4 max-h-72 overflow-y-auto text-sm text-gray-300 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <strong className="text-white font-semibold flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                Community Guidelines
              </strong>
              <p className="leading-relaxed text-gray-400">
                Be respectful. Harassment, hate speech, or abusive behavior is
                strictly prohibited.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <strong className="text-white font-semibold flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Age Requirement
              </strong>
              <p className="leading-relaxed text-gray-400">You must be 18 years or older to use this platform.</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <strong className="text-white font-semibold flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                Privacy
              </strong>
              <p className="leading-relaxed text-gray-400">
                Do not share personal information (like phone numbers). Chats are peer-to-peer and
                not recorded.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
              <strong className="text-white font-semibold flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                Prohibited Content
              </strong>
              <p className="leading-relaxed text-gray-400">
                Nudity, sexual content, illegal activity, or screen recording is
                not allowed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
              <strong className="text-white font-semibold flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                Moderation
              </strong>
              <p className="leading-relaxed text-gray-400">
                Violations may result in reports, blocks, or permanent bans.
              </p>
            </div>
          </div>
        )}

        {/* Checkbox */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                id="accept"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-green-500/50 bg-white/5 checked:bg-green-500 checked:border-green-500 cursor-pointer transition-all duration-200 appearance-none checked:after:content-['✓'] checked:after:text-white checked:after:text-xs checked:after:flex checked:after:items-center checked:after:justify-center"
              />
            </div>
            <label htmlFor="accept" className="text-sm text-gray-300 leading-relaxed cursor-pointer select-none">
              I confirm that I am <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white font-bold text-sm">18+</span>{" "}
              and agree to the Terms & Community Guidelines
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Cancel
          </button>

          <button
            disabled={!accepted}
            onClick={onAccept}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
          >
            Accept & Continue
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-gray-500 mt-5 leading-relaxed">
          By accepting, you agree to follow our community standards and guidelines.
        </p>
      </div>
    </div>
  );
}

export default TermsModal;