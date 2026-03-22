"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6 text-white">
      <div className="flex flex-col items-center justify-center z-10 space-y-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-12 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/30">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 text-center text-balance">
          Cast Your Votes Securely
        </h1>
        <p className="text-lg md:text-xl text-indigo-100 max-w-lg text-center font-medium">
          The next generation of democratic participation. Powered by Zero-Trust Architecture, Biometrics, and Immutable Records.
        </p>
        <Link 
          href="/login" 
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 ease-in-out bg-indigo-600 rounded-full hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
        >
          <span className="mr-2">Start Voting Process</span>
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </Link>
        
        {/* Phase 2 Reset Admin Button */}
        <button 
          onClick={async () => {
             await fetch("http://localhost:8000/vote/reset", { method: "POST" });
             alert("Phase 2 Started: All databases reset, all users re-authorized to vote!");
          }}
          className="px-6 py-2 border-2 border-emerald-500/50 text-emerald-400 rounded-full font-bold hover:bg-emerald-400/20 transition-colors mt-6 text-sm"
        >
          Start Phase 2 Voting (Reset State)
        </button>
      </div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl"></div>
      </div>
    </main>
  );
}
