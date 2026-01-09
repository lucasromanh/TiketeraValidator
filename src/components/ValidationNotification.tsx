import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketType } from '../types';
import { CheckCircle2, XCircle, GlassWater, Ticket as TicketIcon } from 'lucide-react';

interface NotificationProps {
    show: boolean;
    type: 'APPROVED' | 'REJECTED';
    ticketType?: TicketType;
    detail?: string;
    reason?: string;
    onClose: () => void;
}

export const ValidationNotification: React.FC<NotificationProps> = ({
    show, type, ticketType, detail, reason, onClose
}) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-8 left-4 right-4 z-[100] pointer-events-none flex justify-center"
                >
                    <div className={`w-full max-w-md p-6 rounded-[32px] shadow-2xl relative overflow-hidden backdrop-blur-xl border border-white/10 ${type === 'APPROVED' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            {type === 'APPROVED' ? <CheckCircle2 size={120} /> : <XCircle size={120} />}
                        </div>

                        <div className="relative z-10 text-white flex items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                                {ticketType === TicketType.DRINK || ticketType === TicketType.POPCORN ? (
                                    <GlassWater size={32} />
                                ) : (
                                    <TicketIcon size={32} />
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">
                                    {type === 'APPROVED' ? 'VALIDACIÓN EXITOSA' : 'ACCESO DENEGADO'}
                                </p>
                                <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">
                                    {type === 'APPROVED' ? detail || 'TICKET VÁLIDO' : reason || 'ERROR'}
                                </h3>
                                {type === 'APPROVED' && (
                                    <div className="px-3 py-1 bg-white/20 rounded-full inline-block mt-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            DISFRUTA TU {ticketType === TicketType.DRINK ? 'TRAGO' : 'EVENTO'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
