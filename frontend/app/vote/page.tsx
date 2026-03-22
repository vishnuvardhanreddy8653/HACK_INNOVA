"use client";
import { useState } from "react";
import Link from "next/link";

const CANDIDATES = [
  { id: 1, name: "Alexandra Chen", party: "Progressive Vision", color: "border-blue-500" },
  { id: 2, name: "Marcus Johnson", party: "Liberty Alliance", color: "border-orange-500" },
  { id: 3, name: "Elena Rodriguez", party: "Green Future", color: "border-emerald-500" },
  { id: 4, name: "NOTA", party: "None of the above", color: "border-zinc-500" },
];

export default function Vote() {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
        <div className="max-w-md p-10 bg-zinc-900 border border-green-500/30 rounded-3xl text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">Vote Cast Successfully</h1>
          <p className="text-zinc-400 mb-8">Your vote has been securely recorded on the immutable ledger. Thank you for participating in the democratic process.</p>
          <Link href="/" className="px-6 py-3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded-xl font-medium transition-colors">
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-2xl flex flex-col p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Official Ballot</h1>
            <p className="text-zinc-400 mt-1">Select one candidate to cast your vote.</p>
          </div>
          <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            Verified
          </div>
        </div>

        <div className="grid gap-4 mb-8">
          {CANDIDATES.map((cand) => (
            <button
              key={cand.id}
              onClick={() => setSelected(cand.id)}
              className={`flex items-center text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                selected === cand.id 
                  ? cand.color + " bg-zinc-800"
                  : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mr-auto-0 ${selected === cand.id ? cand.color : "border-zinc-600"}`}>
                {selected === cand.id && <div className={`w-3 h-3 rounded-full ${cand.color.replace('border-', 'bg-')}`}></div>}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{cand.name}</h3>
                <p className="text-zinc-400 text-sm">{cand.party}</p>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={async () => {
            if (!selected) return;
            const voterId = localStorage.getItem("voter_id");
            if (!voterId) {
              alert("Critical Authentication Error: Missing Voter Context");
              return;
            }
            try {
              const res = await fetch(`http://localhost:8000/vote/?voter_id=${voterId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ candidate_id: selected })
              });
              
              if (res.ok) {
                 setSubmitted(true);
              } else {
                 const err = await res.json();
                 alert(`Ballot Error: ${err.detail || "Database lock"}`);
              }
            } catch (err) {
              alert("Network error connecting to the ledger");
            }
          }}
          disabled={!selected}
          className="w-full py-4 rounded-xl font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/25"
        >
          {selected ? "Submit Encrypted Vote" : "Please select a candidate"}
        </button>
      </div>
    </main>
  );
}
