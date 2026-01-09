
import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  active: boolean;
}

// Accessing the global library loaded via script tag in index.html
declare var Html5Qrcode: any;

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, active }) => {
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const html5QrCodeRef = useRef<any>(null);
  const lastScanRef = useRef<string | null>(null);
  // Fix: Replaced NodeJS.Timeout with any to avoid "Cannot find namespace 'NodeJS'" error in environments without Node.js types.
  const scanTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (active) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [active]);

  const startScanner = async () => {
    if (html5QrCodeRef.current) return;
    
    setIsStarting(true);
    setError(null);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          // Debounce same scans to avoid multiple triggers
          if (decodedText !== lastScanRef.current) {
            lastScanRef.current = decodedText;
            onScan(decodedText);
            
            // Clear last scan after 3 seconds to allow re-scanning same code if needed
            if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = setTimeout(() => {
              lastScanRef.current = null;
            }, 3000);
          }
        },
        (errorMessage: string) => {
          // Normal feedback during scanning, ignore unless it's a critical failure
        }
      );
      setIsStarting(false);
    } catch (err: any) {
      console.error("Camera Error:", err);
      setIsStarting(false);
      setError("Error al acceder a la cámara. Asegúrate de dar permisos.");
      html5QrCodeRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current = null;
      } catch (e) {
        console.error("Error stopping scanner", e);
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[48px] bg-black border-4 border-slate-800 shadow-2xl relative aspect-square">
      {/* Target Container for Camera */}
      <div id="qr-reader" className="w-full h-full object-cover"></div>

      {/* Loading State */}
      {isStarting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-500">Iniciando Cámara...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur-md p-8 text-center z-20">
          <AlertCircle className="w-12 h-12 text-white mb-4" />
          <p className="text-white font-black text-sm uppercase leading-tight mb-6">{error}</p>
          <button 
            onClick={startScanner}
            className="px-6 py-3 bg-white text-red-600 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Modern Overlay HUD */}
      {!error && !isStarting && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanning Box Outline */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-3xl border-2 border-white/10">
             {/* Corners */}
            <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
            <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
            
            {/* Animated Scan Line */}
            <div className="absolute top-0 left-4 right-4 h-0.5 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>

          {/* Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
              <Camera size={14} className="text-blue-500" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Lente Posterior Activa</span>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0.2; }
          50% { top: 90%; opacity: 1; }
        }
        #qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};
