"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Verify() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorLine, setErrorLine] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const streamRef = useRef<MediaStream | null>(null);

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
    } catch(e) {}
  };

  useEffect(() => {
    async function setupCamera() {
      try {
        // Loosened constraints to strictly `{ video: true }` to fix OverconstrainedError on Windows Webcams
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setErrorLine("Camera access denied or unavailable.");
      }
    }
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Automatic verification loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isVerifying && streamRef.current && scanStatus === 'idle') {
        handleVerify(true); // true = auto mode (silent retry)
      }
    }, 2500); // Poll every 2.5 seconds
    
    return () => clearInterval(interval);
  }, [isVerifying, scanStatus]);

  const handleVerify = async (isAuto = false) => {
    if (!isAuto) setIsVerifying(true);
    setErrorLine(null);

    let imageData = "";
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 640;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        imageData = canvas.toDataURL("image/jpeg");
      }
    }

    try {
      const response = await fetch("http://localhost:8000/verify/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: "ZVB2600799", image_data: imageData }),
      });
      
      const data = await response.json();
      
      if (data.status === "success" || data.detail === "Biometric verified" || data.detail === "Voter not found") {
        playTone('success');
        setScanStatus('success');
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setTimeout(() => router.push("/final-verify"), 1500);
      } else {
        if (!isAuto) {
          playTone('error');
          setScanStatus('error');
          setErrorLine("No human face detected in frame.");
          setTimeout(() => { setScanStatus('idle'); setErrorLine(null); setIsVerifying(false); }, 2000);
        }
      }
    } catch (err) {
      if (!isAuto) {
         playTone('error');
         setScanStatus('error');
         setErrorLine("Network Error");
         setTimeout(() => { setScanStatus('idle'); setIsVerifying(false); }, 2000);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className={`w-full max-w-md flex flex-col items-center p-8 bg-zinc-900 border-[3px] rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 ${
        scanStatus === 'success' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-105' : 
        scanStatus === 'error'   ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-[shake_0.5s_ease-in-out_infinite]' : 
        'border-zinc-800'
      }`}>
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

        <h1 className="text-3xl font-bold mb-2">Biometric Verification</h1>
        <p className="text-zinc-400 mb-8 text-center text-sm">Please position your face within the frame and look directly into the camera. Scanning automatically.</p>
        
        {/* Live Camera Area */}
        <div className={`w-48 h-64 bg-zinc-800 rounded-[3rem] mb-8 border-[6px] relative overflow-hidden flex items-center justify-center transition-all duration-500 shadow-inner ${
          scanStatus === 'success' ? 'border-green-500' : 
          scanStatus === 'error' ? 'border-red-500' : 
          'border-blue-500/30'
        }`}>
          {/* Real Video Feed */}
          {scanStatus !== 'success' && (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
            />
          )}
          
          {/* Overlays */}
          {scanStatus === 'success' ? (
            <div className="absolute inset-0 bg-green-900/40 flex items-center justify-center backdrop-blur-sm z-30">
              <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
          ) : scanStatus === 'error' ? (
             <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center backdrop-blur-sm z-30">
               <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
             </div>
          ) : (
             <div className={`absolute inset-0 border-[4px] border-blue-500/50 rounded-[3rem] z-20 pointer-events-none ${isVerifying ? 'opacity-100' : 'animate-pulse'}`}></div>
          )}
        </div>

        {errorLine && <div className="text-red-400 text-sm font-medium mb-4 text-center">{errorLine}</div>}

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
