"use client";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

const VOTER_ID = "ZVB2600799"; // Your voter ID in the database

export default function DebugQR() {
  const [scanned, setScanned] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [linkStatus, setLinkStatus] = useState<"idle" | "linking" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleScan = (result: any) => {
    if (result && result.length > 0 && scanning) {
      setScanned(result[0].rawValue);
      setScanning(false);
    }
  };

  const linkCard = async () => {
    if (!scanned) return;
    setLinkStatus("linking");
    try {
      const res = await fetch("http://localhost:8000/admin/link-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: VOTER_ID, scanned_qr: scanned }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setLinkStatus("done");
        setMessage(data.message);
      } else {
        setLinkStatus("error");
        setMessage(data.detail || "Failed to link QR");
      }
    } catch {
      setLinkStatus("error");
      setMessage("Network error — is the backend running?");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-8 gap-6">
      <h1 className="text-2xl font-bold text-yellow-400">🔧 QR Card Setup</h1>
      <p className="text-zinc-400 text-sm text-center max-w-sm">
        Scan your physical Voter ID QR code once to link it to your account. After this, the login page will work.
      </p>

      {scanning ? (
        <div className="w-72 h-72 border-4 border-yellow-500 rounded-2xl overflow-hidden">
          <Scanner onScan={handleScan} sound={false} components={{ finder: false }} />
        </div>
      ) : (
        <div className="w-full max-w-lg space-y-4">
          {/* Show scanned raw value */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Scanned QR Data ({scanned?.length} chars)</p>
            <code className="block text-emerald-400 text-xs break-all leading-relaxed">
              {scanned}
            </code>
          </div>

          {/* Link button */}
          {linkStatus === "idle" && (
            <button
              onClick={linkCard}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition-all"
            >
              ✅ Link this card to voter {VOTER_ID}
            </button>
          )}

          {linkStatus === "linking" && (
            <div className="w-full py-4 bg-zinc-700 rounded-xl font-bold text-center animate-pulse">
              Saving to database...
            </div>
          )}

          {linkStatus === "done" && (
            <div className="space-y-3">
              <div className="w-full py-4 bg-green-700/50 border border-green-500 rounded-xl font-bold text-center text-green-300">
                🎉 Card linked successfully!
              </div>
              <p className="text-green-400 text-center text-sm">{message}</p>
              <a
                href="/login"
                className="block w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-center text-white transition-all"
              >
                → Go to Login Page
              </a>
            </div>
          )}

          {linkStatus === "error" && (
            <div className="space-y-3">
              <div className="w-full py-4 bg-red-700/50 border border-red-500 rounded-xl font-bold text-center text-red-300">
                ❌ Error: {message}
              </div>
              <button
                onClick={() => { setScanned(null); setScanning(true); setLinkStatus("idle"); }}
                className="w-full py-3 bg-zinc-700 rounded-xl hover:bg-zinc-600"
              >
                Try Again
              </button>
            </div>
          )}

          {linkStatus === "idle" && (
            <button
              onClick={() => { setScanned(null); setScanning(true); }}
              className="w-full py-2 text-zinc-500 text-sm hover:text-zinc-300"
            >
              Scan again
            </button>
          )}
        </div>
      )}
    </main>
  );
}
