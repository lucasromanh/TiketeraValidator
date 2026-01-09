import React, { useState, useEffect, useRef } from 'react';
import {
  OperationType, UserRole, TicketStatus, User, EventSession, Ticket, TicketType
} from './types';
import {
  QrCode, LogOut, ChevronRight, Ticket as TicketIcon, GlassWater, UserCircle,
  Camera, History, LayoutGrid, Zap, Settings, ArrowLeft, CheckCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationOverlay } from './components/AnimationOverlay';
import { QRScanner } from './components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';
import { ValidationNotification } from './components/ValidationNotification';
import { api } from './services/api';

// --- Mappings ---
const OPERATION_MODES: Record<OperationType, { label: string; value: string }[]> = {
  [OperationType.BOLICHE]: [
    { label: 'ENTRADA GENERAL', value: 'ENTRY' },
    { label: 'ACCESO VIP', value: 'VIP' },
    { label: 'BARRA / TRAGOS', value: 'DRINK' },
  ],
  [OperationType.EVENTO]: [
    { label: 'ACCESO PPAL', value: 'ENTRY' },
    { label: 'ACCESO VIP', value: 'VIP' },
  ],
  [OperationType.EVENTO_GRANDE]: [
    { label: 'CONTROL ACCESO', value: 'ENTRY' },
    { label: 'PUNTO CONSUMO', value: 'DRINK' },
  ],
  [OperationType.CINE]: [
    { label: 'INGRESO SALA', value: 'ENTRY' },
    { label: 'CANDY BAR', value: 'POPCORN' },
  ]
};

// LOGIN VIEW PREMIUM
const LoginView: React.FC<{
  pinInput: string;
  setPinInput: (val: string) => void;
  error: string | null;
  handleLogin: (creds: { pin?: string; name?: string; email?: string }) => void;
}> = ({ pinInput, setPinInput, error, handleLogin }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAssistant, setIsAssistant] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white selection:bg-blue-500/30">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-2 italic flex flex-col leading-none drop-shadow-2xl">
          <span className="block text-white">MIRA SOLE</span>
          <span className="block text-blue-500 mt-1">HICE EL MIO</span>
        </h1>
        <p className="text-slate-500 font-bold text-[10px] tracking-[0.4em] uppercase mt-4">Professional Access System</p>
      </motion.div>

      <div className="w-full max-w-xs space-y-10">
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <QrCode size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-blue-200">Acceso Seguro</span>
          </div>

          <div className="mb-8">
            <button
              onClick={() => setIsAssistant(!isAssistant)}
              className={`w-full py-4 border rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 transition-all group ${isAssistant ? 'border-blue-500 bg-blue-500/10' : 'border-white/10'}`}
            >
              <UserCircle size={20} className={`${isAssistant ? 'text-blue-400' : 'text-slate-400'} group-hover:text-white`} />
              <span className={`${isAssistant ? 'text-blue-200' : 'text-slate-300'} text-xs font-black uppercase tracking-widest group-hover:text-white`}>
                {isAssistant ? 'VOLVER A PIN' : 'SOY ASISTENTE'}
              </span>
            </button>
          </div>

          <div className="space-y-6">
            {!isAssistant ? (
              <div className="relative flex justify-between gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-14 h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${pinInput.length > i
                    ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                    : 'border-slate-700 bg-black/40'
                    }`}>
                    {pinInput.length > i && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white]"
                      />
                    )}
                  </div>
                ))}
                <input
                  ref={inputRef}
                  type="tel"
                  autoFocus
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPinInput(val);
                    if (val.length === 4) handleLogin({ pin: val });
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-1 block">Nombre Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Celeste Peralta"
                    className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none placeholder:text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="celeste@test.com"
                    className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none placeholder:text-slate-700"
                  />
                </div>
                <button
                  onClick={() => handleLogin({ name, email })}
                  disabled={!name || !email}
                  className="w-full py-3 bg-blue-600 rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  Confirmar Ingreso
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <p className="text-red-400 text-center font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </p>
              </motion.div>
            )}
          </div>
        </div>
        <p className="text-center text-slate-600 text-[10px] uppercase font-black tracking-widest opacity-70">
          {!isAssistant ? 'Ingrese su PIN personal' : 'Validación de Asistente'}
        </p>
      </div>
    </div>
  );
};

// VISTA ASISTENTE (RESTAURADA A PREMIUM)
const AssistantView: React.FC<any> = ({ currentUser, logout, myTickets, events, setTickets }) => {
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [notifShow, setNotifShow] = useState(false);
  const [notifData, setNotifData] = useState<any>({});

  // Polling Sync
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await api.syncUserTickets(currentUser.id);
        if (res.status === 'success' && res.tickets) {
          // Notificación logic
          const newTickets = res.tickets as Ticket[];
          newTickets.forEach((nt) => {
            const oldT = myTickets.find((t: Ticket) => t.id === nt.id);
            if (oldT && oldT.status === 'VALID' && nt.status === 'USED') {
              setNotifData({ type: 'APPROVED', ticketType: nt.type, detail: nt.metadata?.detail || nt.type });
              setNotifShow(true);
              setTimeout(() => setNotifShow(false), 5000);
              if (viewingTicket?.id === nt.id) setViewingTicket(null);
            }
          });
          setTickets(newTickets);
        }
      } catch (e) { }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [currentUser, myTickets, setTickets, viewingTicket]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-white">
      <ValidationNotification show={notifShow} type={notifData.type || 'APPROVED'} ticketType={notifData.ticketType} detail={notifData.detail} onClose={() => setNotifShow(false)} />

      {/* HEADER PREMIUM */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black border-2 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            {currentUser.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-black italic text-lg leading-none text-white">MIRA <span className="text-blue-500">SOLE</span></h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{currentUser.name}</p>
          </div>
        </div>
        <button onClick={logout} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <LogOut size={16} />
        </button>
      </div>

      {/* DASHBOARD HERO */}
      <div className="px-6 mb-6">
        <div className="bg-[#1e293b] rounded-[32px] p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Dashboard Usuario</p>
            <h1 className="text-4xl font-black text-white leading-tight mb-2">
              Hola,<br />
              <span className="text-blue-500">{currentUser.name.split(' ')[0]}.</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">
              Salta • {myTickets.filter((t: Ticket) => t.status === 'VALID').length} Tickets Activos
            </p>
          </div>
        </div>
      </div>

      {/* TICKET LIST */}
      <div className="flex-1 px-6 pb-24 overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Tus Accesos</h3>
          <div className="h-[1px] flex-1 bg-slate-800" />
        </div>

        <div className="space-y-4">
          {myTickets.map((ticket: Ticket) => {
            const event = events.find((e: EventSession) => e.id === ticket.eventId);
            const isUsed = ticket.status === 'USED';
            return (
              <motion.div
                whileTap={{ scale: 0.98 }}
                key={ticket.id}
                className={`relative rounded-[32px] overflow-hidden border ${isUsed ? 'bg-black/40 border-slate-800 opacity-60' : 'bg-[#1e293b] border-slate-700 shadow-lg'}`}
              >
                {/* Status Grid Background */}
                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isUsed ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]'}`}>
                      {isUsed ? 'USADO' : 'ACTIVO'}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {ticket.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-1 leading-tight">{event?.name || 'Evento'}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-6">
                    <OperationSelectorIcon type={event?.operationType || OperationType.BOLICHE} />
                    <span>{event?.venue || 'Ubicación'}</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">CÓDIGO DIGITAL</p>
                      <p className="text-sm font-black text-white uppercase">{ticket.metadata?.detail || ticket.code}</p>
                    </div>
                    {!isUsed ? (
                      <button
                        onClick={() => setViewingTicket(ticket)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 font-bold text-xs uppercase tracking-wider text-white shadow-lg flex items-center gap-2"
                      >
                        VER QR <ChevronRight size={14} />
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                        {ticket.type === 'DRINK' ? <GlassWater size={18} className="text-slate-600" /> : <QrCode size={18} className="text-slate-600" />}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* MODAL QR */}
      <AnimatePresence>
        {viewingTicket && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white text-black flex flex-col"
          >
            <div className="p-6 flex justify-end">
              <button onClick={() => setViewingTicket(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-2 hover:text-black transition-colors">
                CERRAR [X]
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-3">Identificador Digital</p>
                <h2 className="text-5xl font-black italic tracking-tighter leading-[0.9] text-black">
                  {events.find((e: any) => e.id === viewingTicket.eventId)?.name}
                </h2>
                <div className="w-8 h-1 bg-blue-600 mx-auto mt-6 rounded-full" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-4">
                  {viewingTicket.metadata?.detail || 'ACCESO GENERAL'}
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="p-4 bg-white rounded-[40px] shadow-2xl border-4 border-black relative cursor-pointer"
              >
                {/* Decorative corners */}
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-white border-4 border-black rounded-full z-10" />
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-white border-4 border-black rounded-full z-10" />
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white border-4 border-black rounded-full z-10" />
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-4 border-black rounded-full z-10" />

                <QRCodeSVG value={`ticket:${viewingTicket.code}`} size={240} className="relative z-0" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-8 py-3 bg-slate-100 rounded-full flex items-center gap-3 shadow-inner"
              >
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle size={12} className="text-white" strokeWidth={4} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Validación Segura</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Icon Helper
const OperationSelectorIcon = ({ type }: { type: OperationType }) => {
  return <div className="w-2 h-2 rounded-full bg-blue-500" />
};

// OPERATION SELECTOR 
const OperationSelector: React.FC<{ setOpProfile: (type: OperationType) => void }> = ({ setOpProfile }) => (
  <div className="min-h-screen flex flex-col p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
    <h1 className="text-xl font-black italic tracking-tighter mb-4 text-center mt-10">MODO OPERATIVO</h1>
    <div className="flex-1 space-y-4">
      {Object.values(OperationType).map((type) => (
        <button key={type} onClick={() => setOpProfile(type)} className="w-full p-8 bg-slate-800/50 border border-white/5 rounded-3xl font-black uppercase text-left hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all group">
          <span className="group-hover:translate-x-2 transition-transform block">{type.replace('_', ' ')}</span>
        </button>
      ))}
    </div>
  </div>
);

// STAFF VIEW Y APP COMPLETO
const StaffView: React.FC<any> = ({
  opProfile, logout, events, selectedEventId, setSelectedEventId,
  animStatus, animReason, animDetails, setAnimStatus,
  activeMode, setActiveMode, cooldown, handleValidate, currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'AUDIT' | 'STATS'>('CAMERA');

  // Calculate mock stats based on available data for now
  // In a real app these should come from the backend per event
  const stats = {
    ok: 0, // This would need backend support for session specific counts
    fail: 0,
    used: 0,
    wrongEvent: 0,
    notFound: 0,
    rateLimit: 0
  };

  const selectedEvent = events.find((e: EventSession) => e.id === selectedEventId);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-white">
      <AnimationOverlay status={animStatus} reason={animReason} details={animDetails} onFinished={() => setAnimStatus(null)} />

      {/* HEADER */}
      <div className="px-4 py-4 flex justify-between items-center bg-[#0f172a] sticky top-0 z-20">
        {!selectedEventId ? (
          <div className="flex flex-col">
            <h1 className="font-black italic text-lg text-white leading-none">MIRA <span className="text-white">SOLE</span></h1>
            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest leading-none mt-1">{opProfile?.replace('_', ' ')}</h2>
          </div>
        ) : (
          <button onClick={() => setSelectedEventId(null)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 active:scale-95">
            <ArrowLeft size={20} className="text-white" />
          </button>
        )}

        {selectedEventId && (
          <div className="flex flex-col items-center">
            <h2 className="font-black italic text-sm text-white uppercase tracking-tighter">{selectedEvent?.name}</h2>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">GATE A</span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{activeMode}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
          <button onClick={logout} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-yellow-500">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {!selectedEventId ? (
        <div className="flex-1 p-6 flex flex-col">
          <h2 className="text-3xl font-black text-white mb-2">SESIONES</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">SELECCIONA EVENTO ACTIVO</p>
          <div className="w-12 h-1 bg-blue-600 rounded-full mb-8" />

          <div className="space-y-4">
            {events.map((ev: EventSession) => (
              <div key={ev.id} className="bg-[#1e293b] p-6 rounded-[32px] border border-slate-700/50 shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="font-black text-xl text-white mb-1">{ev.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ev.venue}</p>
                  </div>

                  <button
                    onClick={() => setSelectedEventId(ev.id)}
                    className="w-full py-4 bg-slate-800/50 border border-blue-500/20 rounded-2xl flex items-center justify-between px-6 hover:bg-blue-600/10 hover:border-blue-500/50 transition-all"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400">LISTO PARA VALIDAR</span>
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* TAB CONTENT */}
          {activeTab === 'CAMERA' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
              {/* SELECTORS */}
              <div className="w-full flex gap-4 mb-8">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-blue-200 uppercase tracking-widest ml-2">Punto de Control</label>
                  <div className="w-full h-12 rounded-2xl border border-blue-500/30 bg-slate-900/50 flex items-center justify-center text-xs font-black uppercase text-white">
                    {activeMode}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ubicación / Gate</label>
                  <select className="w-full h-12 rounded-2xl border border-slate-700 bg-slate-800 text-center text-xs font-black uppercase text-white outline-none appearance-none">
                    <option>PUERTA A</option>
                  </select>
                </div>
              </div>

              {/* SCANNER FRAME */}
              <div className="relative w-full aspect-square max-w-[350px] mx-auto">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-black/80 backdrop-blur-md border border-green-500/30 px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">SYNC ACTIVE</span>
                  </div>
                </div>

                <div className="w-full h-full rounded-[40px] overflow-hidden border-2 border-slate-700 relative shadow-2xl bg-black">
                  <QRScanner onScan={handleValidate} active={!animStatus && !cooldown} />

                  {/* OVERLAY ELEMENTS */}
                  <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none rounded-[40px]" />
                  {/* CORNERS */}
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl pointer-events-none" />
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl pointer-events-none" />
                  <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl pointer-events-none" />
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl pointer-events-none" />

                  <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                      <Camera size={14} className="text-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">LENTE POSTERIOR ACTIVA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4 text-slate-500">
                <div className="h-[1px] w-12 bg-slate-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.2rem]">LECTURA ACTIVA</span>
                <div className="h-[1px] w-12 bg-slate-800" />
              </div>
            </div>
          )}

          {activeTab === 'STATS' && (
            <div className="flex-1 p-6 pb-32 overflow-y-auto">
              <h2 className="text-3xl font-black text-white mb-8 uppercase italic">Métricas</h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/50 border border-green-500/20 p-6 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl" />
                  <CheckCircle size={24} className="text-green-500 mb-2" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">OK</span>
                  <span className="text-4xl font-black text-white tracking-tighter">0</span>
                </div>
                <div className="bg-slate-900/50 border border-red-500/20 p-6 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl" />
                  <XCircle size={24} className="text-red-500 mb-2" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">FAIL</span>
                  <span className="text-4xl font-black text-white tracking-tighter">0</span>
                </div>
              </div>

              <div className="bg-[#1e293b] rounded-[32px] p-8 border border-slate-700/50">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">CAUSAS RECHAZO</h3>
                <div className="space-y-6">
                  {[
                    { l: 'USED', v: stats.used },
                    { l: 'WRONG EVENT', v: stats.wrongEvent },
                    { l: 'NOT FOUND', v: stats.notFound },
                    { l: 'RATE LIMIT', v: stats.rateLimit }
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.l}</span>
                        <span className="text-xs font-bold text-white">{s.v} <span className="text-slate-600 text-[10px]">(0%)</span></span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-slate-600 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-blue-600 rounded-[32px] p-8 relative overflow-hidden shadow-xl">
                <Zap size={120} className="text-blue-500 absolute -right-4 -bottom-4 opacity-50 rotate-[-15deg]" />
                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Zap size={24} className="text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic leading-none">SYSTEM ACTIVE</h3>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">SINCRONIZACIÓN REGIONAL OK</p>
                  </div>
                </div>
                <div className="relative z-10 flex gap-8 mt-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">LATENCIA</p>
                    <p className="text-xl font-black text-white">42 MS</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">STATUS</p>
                    <p className="text-xl font-black text-white">OPTIMAL</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM NAVBAR */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent flex items-center justify-center gap-12 pb-4">
            <button onClick={() => setActiveTab('CAMERA')} className={`flex flex-col items-center gap-2 group ${activeTab === 'CAMERA' ? 'scale-110' : 'opacity-50 hover:opacity-100'} transition-all`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${activeTab === 'CAMERA' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-transparent text-slate-400'}`}>
                <QrCode size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'CAMERA' ? 'text-blue-400' : 'text-slate-500'}`}>CÁMARA</span>
            </button>

            <button onClick={() => setActiveTab('AUDIT')} className={`flex flex-col items-center gap-2 group ${activeTab === 'AUDIT' ? 'scale-110' : 'opacity-50 hover:opacity-100'} transition-all`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${activeTab === 'AUDIT' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-transparent text-slate-400'}`}>
                <History size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'AUDIT' ? 'text-blue-400' : 'text-slate-500'}`}>AUDITAR</span>
            </button>

            <button onClick={() => setActiveTab('STATS')} className={`flex flex-col items-center gap-2 group ${activeTab === 'STATS' ? 'scale-110' : 'opacity-50 hover:opacity-100'} transition-all`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${activeTab === 'STATS' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-transparent text-slate-400'}`}>
                <LayoutGrid size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'STATS' ? 'text-blue-400' : 'text-slate-500'}`}>STATS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  // ... Lógica idéntica al paso anterior (Login, API, State) ...
  // Solo cambia que usamos las vistas premium de arriba
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [opProfile, setOpProfile] = useState<OperationType | null>(null);

  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);

  const [events, setEvents] = useState<EventSession[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState('ENTRY');

  const [animStatus, setAnimStatus] = useState<'processing' | 'approved' | 'rejected' | null>(null);
  const [animReason, setAnimReason] = useState<string | undefined>(undefined);
  const [animDetails, setAnimDetails] = useState<string | undefined>(undefined);

  const handleLogin = async (creds: { pin?: string; name?: string; email?: string }) => {
    try {
      const response = await api.login(creds);
      const userData = response.data || (response.id ? response : null);

      if (response.status === 'success' || userData) {
        const user = (response.data || response) as User;

        // Fallback role fix si viene como string
        if (typeof user.role === 'string') user.role = user.role as UserRole;

        setCurrentUser(user);
        setCurrentRole(user.role);
        setPinInput('');
        setError(null);

        const initData = await api.getInitialData(user.id, String(user.role));
        setEvents((initData.events || []) as EventSession[]);
        setTickets((initData.tickets || []) as Ticket[]);
      } else {
        setError('Acceso Denegado');
        setPinInput('');
        setTimeout(() => setError(null), 2000);
      }
    } catch (e) { setError('Error de Conexión'); setTimeout(() => setError(null), 2000); }
  };

  const handleValidate = async (qrData: string) => {
    if (cooldown || animStatus) return;
    setAnimStatus('processing');
    await new Promise(r => setTimeout(r, 600)); // Make it feel substantial

    try {
      const code = qrData.replace('ticket:', '');
      const res = await api.validateTicket(code, selectedEventId || '', activeMode, currentUser?.id || '');

      if (res.status === 'success') {
        setTickets(prev => prev.map(t => t.code === code ? { ...t, status: TicketStatus.USED } : t));
        setAnimStatus('approved');
      } else {
        setAnimStatus('rejected');
        setAnimReason(res.reason || 'ERROR');
        setAnimDetails(res.details || 'Ticket inválido');
      }
    } catch {
      setAnimStatus('rejected');
      setAnimReason('ERR_NET');
    }
  };

  const logout = () => { setCurrentUser(null); setCurrentRole(null); setOpProfile(null); setSelectedEventId(null); setPinInput(''); setTickets([]); setEvents([]); };

  if (!currentUser) return <LoginView pinInput={pinInput} setPinInput={setPinInput} error={error} handleLogin={handleLogin} />;
  if (currentRole === UserRole.ASSISTANT) return <AssistantView currentUser={currentUser} logout={logout} myTickets={tickets} events={events} setTickets={setTickets} />;
  if (!opProfile) return <OperationSelector setOpProfile={setOpProfile} />;

  return <StaffView opProfile={opProfile} logout={logout} events={events} selectedEventId={selectedEventId} setSelectedEventId={setSelectedEventId} animStatus={animStatus} animReason={animReason} animDetails={animDetails} setAnimStatus={setAnimStatus} activeMode={activeMode} setActiveMode={setActiveMode} cooldown={cooldown} handleValidate={handleValidate} currentUser={currentUser} />;
}

export default App;
