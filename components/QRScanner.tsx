
import React, { useEffect, useRef } from 'react';

interface QRScannerProps {
  onScan: (data: string) => void;
  active: boolean;
}

declare var Html5QrcodeScanner: any;

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, active }) => {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (active && !scannerRef.current) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      const scanner = new (window as any).Html5QrcodeScanner(
        "qr-reader", 
        config, 
        /* verbose= */ false
      );

      scanner.render((decodedText: string) => {
        onScan(decodedText);
      }, (err: any) => {
        // Quiet error
      });

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        // Cleanup handled by Html5QrcodeScanner usually needs clearing
        try {
          // scannerRef.current.clear(); // Sometimes causes issues in rapid remounts
        } catch(e) {}
      }
    };
  }, [active, onScan]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-3xl bg-black border-4 border-slate-800 shadow-2xl relative">
      <div id="qr-reader" className="w-full h-full"></div>
      <div className="absolute inset-0 pointer-events-none border-2 border-white/20 m-12 rounded-lg">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
      </div>
    </div>
  );
};
