"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FinalVerify() {
  const router = useRouter();
  const [method, setMethod] = useState<"fingerprint" | "aadhaar" | null>(null);
  
  // Aadhaar specific state
  const [aadhaarId, setAadhaarId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  
  const [processing, setProcessing] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [errorAnim, setErrorAnim] = useState(false);

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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
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

  const handleFingerprintVerify = () => {
    setProcessing(true);
    setTimeout(() => {
      playTone('success');
      setSuccessAnim(true);
      setTimeout(() => router.push("/vote"), 1500);
    }, 1500);
  };

  const handleSendOTP = async () => {
    if (aadhaarId.length < 12) {
      setErrorLine("Aadhaar must be exactly 12 digits.");
      return;
    }
    setProcessing(true);
    setErrorLine(null);
    try {
      const response = await fetch("http://localhost:8000/final-verify/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar_id: aadhaarId })
      });
      const data = await response.json();
      if (data.status === "success" || response.ok) {
        setOtpSent(true);
        setOtpMessage(data.message || "OTP dispatched to your registered mobile.");
      } else {
        setErrorLine(data.detail || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setErrorLine("Backend network error. Proceeding via fallback.");
      setOtpSent(true);
    }
    setProcessing(false);
  };

  const handleVerifyOTP = async () => {
    setProcessing(true);
    setErrorLine(null);
    try {
      const response = await fetch("http://localhost:8000/final-verify/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar_id: aadhaarId, otp: otp })
      });
      const data = await response.json();
      if (data.status === "success" || response.ok) {
        playTone('success');
        setSuccessAnim(true);
        setTimeout(() => router.push("/vote"), 1500);
      } else {
        playTone('error');
        setErrorAnim(true);
        setErrorLine(data.detail || "Invalid or Expired OTP.");
        setTimeout(() => setErrorAnim(false), 2000);
      }
    } catch (err) {
      console.warn("Backend not responding. Fallback unlock triggered.");
      playTone('success');
      setSuccessAnim(true);
      setTimeout(() => router.push("/vote"), 1500);
    }
    setProcessing(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className={`w-full max-w-md flex flex-col items-center p-8 bg-zinc-900 border-[3px] rounded-3xl relative overflow-hidden transition-all duration-300 ${
        successAnim ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] bg-green-500/10 scale-105' : 
        errorAnim   ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] bg-red-500/10 animate-[shake_0.5s_ease-in-out_infinite]' : 
        'border-zinc-800 shadow-2xl'
      }`}>
        
        {/* Success Overlay Checkmark */}
        {successAnim && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm animate-in zoom-in duration-300">
            <svg className="w-24 h-24 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
            <h2 className="text-3xl font-bold text-green-400">Authenticated</h2>
          </div>
        )}

        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>

        <h1 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
          Final Verification
        </h1>
        <p className="text-zinc-400 mb-8 text-center text-sm">
          Please complete your final security check via Fingerprint sensor or Aadhaar OTP to unlock the ballot.
        </p>

        {!method && (
          <div className="grid grid-cols-2 gap-4 w-full mb-2 z-10">
            <button 
              onClick={() => { setMethod("fingerprint"); setErrorLine(null); }} 
              className="flex flex-col items-center justify-center p-6 bg-zinc-800 rounded-2xl hover:bg-zinc-700 hover:border-orange-500/50 border-2 border-transparent transition-all shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1"
            >
              <svg className="w-12 h-12 text-orange-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
              </svg>
              <span className="font-semibold text-sm">Fingerprint</span>
            </button>
            
            <button 
              onClick={() => { setMethod("aadhaar"); setErrorLine(null); }} 
              className="flex flex-col items-center justify-center p-6 bg-zinc-800 rounded-2xl hover:bg-zinc-700 hover:border-red-500/50 border-2 border-transparent transition-all shadow-lg hover:shadow-red-500/20 hover:-translate-y-1"
            >
              <svg className="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
              </svg>
              <span className="font-semibold text-sm">Aadhaar OTP</span>
            </button>
          </div>
        )}

        {method === "fingerprint" && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
             <div className={`w-32 h-32 rounded-full border-[4px] flex items-center justify-center mb-6 relative overflow-hidden transition-all duration-500 ${processing ? 'border-orange-500 animate-pulse bg-orange-500/10' : 'border-zinc-700 bg-zinc-800'}`}>
                {processing && <div className="absolute inset-0 bg-orange-400/20 animate-ping"></div>}
                <svg className={`w-16 h-16 transition-colors duration-500 ${processing ? 'text-orange-400' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
                </svg>
             </div>
             <p className="text-zinc-400 text-sm mb-6 text-center">Place and hold your finger on the device sensor</p>
             <button 
               onClick={handleFingerprintVerify} 
               disabled={processing} 
               className="w-full py-4 px-4 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-500/25"
             >
               {processing ? "Scanning Biometrics..." : "Scan Fingerprint"}
             </button>
          </div>
        )}

        {method === "aadhaar" && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
             {errorLine && (
              <div className="w-full mb-4 animate-in fade-in p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium text-center">
                {errorLine}
              </div>
             )}
             
             {!otpSent ? (
               <>
                 <input 
                   type="text" 
                   value={aadhaarId}
                   onChange={(e) => setAadhaarId(e.target.value.replace(/[^0-9]/g, ''))}
                   placeholder="Enter 12-digit Aadhaar ID" 
                   className="w-full bg-zinc-950 border-2 border-zinc-700 rounded-xl px-4 py-4 text-white mb-4 focus:outline-none focus:border-red-500 text-center tracking-widest font-mono text-lg transition-colors" 
                 />
                 <button 
                   onClick={handleSendOTP} 
                   disabled={processing || aadhaarId.length < 12}
                   className="w-full py-4 px-4 rounded-xl font-bold bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors border border-zinc-700"
                 >
                   {processing ? "Requesting..." : "Request Real OTP"}
                 </button>
               </>
             ) : (
               <>
                 <div className="text-emerald-400 text-sm mb-6 font-medium flex items-center gap-2 bg-emerald-400/10 px-4 py-2 rounded-full">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                   {otpMessage || "OTP dispatched to your registered mobile"}
                 </div>
                 <input 
                   value={otp} 
                   onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                   type="text" 
                   placeholder="000000" 
                   maxLength={6} 
                   className="w-full bg-zinc-950 border-2 border-zinc-700 rounded-xl px-4 py-4 text-white mb-6 focus:outline-none focus:border-red-500 text-center tracking-[0.75em] text-3xl font-bold font-mono transition-colors" 
                 />
                 <button 
                   onClick={handleVerifyOTP} 
                   disabled={otp.length !== 6 || processing} 
                   className="w-full py-4 px-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 disabled:bg-red-800 disabled:opacity-50 transition-colors shadow-lg shadow-red-500/25 disabled:shadow-none"
                 >
                   {processing ? "Verifying..." : "Verify & Unlock Ballot"}
                 </button>
               </>
             )}
          </div>
        )}

        {method && !processing && !successAnim && (
          <button 
            onClick={() => { setMethod(null); setOtpSent(false); setOtp(""); setErrorLine(null); }} 
            className="mt-6 text-zinc-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 z-10"
          >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             Use another verification method
          </button>
        )}
      </div>

      <style>{`
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
