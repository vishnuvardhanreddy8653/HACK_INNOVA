"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from '@yudiel/react-qr-scanner';

export default function Login() {
  const router = useRouter();
  const [errorLine, setErrorLine] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Web Audio API for standalone synthesized success/error tones (no mp3 files needed)
  const playTone = (type: 'success' | 'error') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'success') {
        osc.type = 'sine';
        // Play a chime (C5 then E5)
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        // Play a buzzer (low frequency dropping)
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.setValueAtTime(120, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Audio context failed or not supported in this browser context", e);
    }
  };

  const handleScan = async (result: any) => {
    if (result && result.length > 0 && isScanning) {
      const qrCodeData = result[0].rawValue;
      setIsScanning(false);
      setErrorLine(null);

      try {
        const response = await fetch("http://localhost:8000/verify/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qr_code: qrCodeData }),
        });
        
        const data = await response.json();
        if (data.status === "success" && response.ok) {
          playTone('success');
          setScanStatus('success');
          localStorage.setItem("session_token", data.session_token);
          localStorage.setItem("voter_id", data.voter_id);
          
          setTimeout(() => {
            router.push("/verify");
          }, 1500);
        } else {
          playTone('error');
          setScanStatus('error');
          setErrorLine(data.detail || "Authentication Failed: Unauthorized ID Card");
          
          setTimeout(() => {
            setScanStatus('idle');
            setIsScanning(true);
            setErrorLine(null);
          }, 2500);
        }
      } catch (err) {
        console.warn("Backend not reachable. Simulating error fallback.");
        playTone('error');
        setScanStatus('error');
        setErrorLine("Network Error: Could not verify identity.");
        
        setTimeout(() => {
          setScanStatus('idle');
          setIsScanning(true);
          setErrorLine(null);
        }, 2500);
      }
    }
  };

  const forceBypass = async () => {
      // Overrides the scanner loop completely!
      setIsScanning(false);
      setScanStatus('idle');
      setErrorLine(null);

      try {
        const response = await fetch("http://localhost:8000/verify/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qr_code: 'ZVB2600799' }),
        });
        const data = await response.json();
        if (data.status === "success" && response.ok) {
          playTone('success');
          setScanStatus('success');
          localStorage.setItem("session_token", data.session_token);
          localStorage.setItem("voter_id", data.voter_id);
          setTimeout(() => router.push("/verify"), 1500);
        }
      } catch (err) { }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-md flex flex-col items-center p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>

        <h1 
          className="text-3xl font-bold mb-2 cursor-pointer hover:text-emerald-300 transition-colors"
          onClick={forceBypass}
          title="Secret Developer Bypass"
        >
          QR Authentication
        </h1>
        <p className="text-zinc-400 mb-8 text-center text-sm">Please scan your official physical Voter ID QR code to begin.</p>
        
        {/* Real QR Scanner Area With Dynamic Feedback */}
        <div className={`w-72 h-72 border-[4px] rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden transition-all duration-300 shadow-2xl ${
          scanStatus === 'success' ? 'border-green-500 bg-green-500/20 shadow-green-500/50 scale-105' :
          scanStatus === 'error' ? 'border-red-500 bg-red-500/20 shadow-red-500/50 animate-[shake_0.5s_ease-in-out_infinite]' :
          'border-emerald-500/50 bg-emerald-950/20'
        }`}>
          {isScanning ? (
            <div className="w-full h-full relative">
               <Scanner
                  onScan={handleScan}
                  onError={(error: any) => console.log(error?.message || error)}
                  sound={false}
                  components={{ finder: false }}
               />
               <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)] animate-[scan_2s_ease-in-out_infinite] z-10 pointer-events-none"></div>
            </div>
          ) : (
            <div className={`font-bold text-2xl flex flex-col items-center animate-in zoom-in duration-300 ${
              scanStatus === 'success' ? 'text-green-400' :
              scanStatus === 'error' ? 'text-red-400' : 'text-emerald-400'
            }`}>
               {scanStatus === 'success' && (
                 <>
                   <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   <span>Verified</span>
                 </>
               )}
               {scanStatus === 'error' && (
                 <>
                   <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                   <span>Denied</span>
                 </>
               )}
               {scanStatus === 'idle' && (
                 <span className="text-emerald-400 animate-pulse">Processing...</span>
               )}
            </div>
          )}
        </div>

        {errorLine && (
          <div className="w-full text-red-400 text-sm font-medium mb-4 text-center animate-in fade-in p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            {errorLine}
          </div>
        )}

      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(288px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
        }
      `}</style>
    </main>
  );
}
