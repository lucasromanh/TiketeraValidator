
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface AnimationOverlayProps {
  status: 'processing' | 'approved' | 'rejected' | null;
  reason?: string;
  details?: string;
  onFinished: () => void;
}

export const AnimationOverlay: React.FC<AnimationOverlayProps> = ({ status, reason, details, onFinished }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status) {
      setVisible(true);
      if (status !== 'processing') {
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(onFinished, 300);
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
  }, [status, onFinished]);

  return (
    <AnimatePresence>
      {visible && status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-md"
        >
          {status === 'processing' && (
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 className="w-20 h-20 text-blue-500" />
              </motion.div>
              <p className="mt-4 text-xl font-bold text-white tracking-widest animate-pulse">PROCESANDO...</p>
            </div>
          )}

          {status === 'approved' && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [1, 2, 3] }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 bg-green-500 rounded-full"
                />
                <CheckCircle2 className="w-32 h-32 text-green-500 relative z-10 shadow-[0_0_50px_rgba(34,197,94,0.5)]" />
              </div>
              <h2 className="mt-6 text-4xl font-black text-green-500 tracking-tighter">VALIDADO</h2>
              <p className="mt-2 text-white font-medium text-center uppercase">{details}</p>
            </motion.div>
          )}

          {status === 'rejected' && (
            <motion.div
              initial={{ x: [-20, 20, -20, 20, 0] }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <XCircle className="w-32 h-32 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]" />
              <h2 className="mt-6 text-4xl font-black text-red-500 tracking-tighter uppercase">RECHAZADO</h2>
              <p className="mt-2 text-white text-xl font-bold uppercase">{reason || 'NO VÁLIDO'}</p>
              {details && <p className="mt-1 text-slate-400 text-sm text-center italic">{details}</p>}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
