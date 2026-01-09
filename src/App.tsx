import React, { useState, useEffect, useRef } from 'react';
import {
  OperationType, UserRole, TicketStatus, User, EventSession, Ticket, ScanAttempt, TicketType
} from './types';
import {
  QrCode, LogOut,
  ChevronRight,
  Ticket as TicketIcon,
  GlassWater
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

const LoginView: React.FC<{
  pinInput: string;
  setPinInput: (val: string) => void;
  error: string | null;
  handleLogin: (pin: string) => void;
}> = ({ pinInput, setPinInput, error, handleLogin }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tighter mb-2 italic flex flex-col leading-none">
          <span className="block">MIRA SOLE</span>
          <span className="block text-blue-500 mt-1">HICE EL MIO</span>
        </h1>
        <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Professional Access System</p>
      </motion.div>
      <div className="w-full max-w-xs space-y-8">
        <div className="space-y-6">
          <div className="relative flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-12 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${pinInput.length > i ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-black'}`}>
                {pinInput.length > i && <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>}
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
                if (val.length === 4) handleLogin(val);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {error && (
            <p className="text-red-500 text-center font-black text-sm uppercase tracking-wider">{error}</p>
          )}
          <p className="text-center text-slate-500 text-[10px] uppercase font-black tracking-widest opacity-50">Ingrese PIN (Ej: 1111, 2222, 5555)</p>
        </div>
      </div>
    </div>
  );
};

const OperationSelector: React.FC<{ setOpProfile: (type: OperationType) => void }> = ({ setOpProfile }) => (
  <div className="min-h-screen flex flex-col p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
    <h1 className="text-xl font-black italic tracking-tighter mb-4 text-center mt-10">MODO OPERATIVO</h1>
    <div className="grid grid-cols-1 gap-4">
      {Object.values(OperationType).map((type) => (
        <button key={type} onClick={() => setOpProfile(type)} className="p-6 bg-white/10 rounded-2xl font-black uppercase text-left hover:bg-white/20 transition-all">
          {type.replace('_', ' ')}
        </button>
      ))}
    </div>
  </div>
);

// --- VISTAS INTERNAS ---

const AssistantView: React.FC<any> = ({ currentUser, logout, myTickets, events, setTickets }) => {
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [notifShow, setNotifShow] = useState(false);
  const [notifData, setNotifData] = useState<any>({});

  // POLLING SYNC: Cada 3 segundos
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await api.syncUserTickets(currentUser.id);
        if (res.status === 'success' && res.tickets) {
          // Comparar si hubo cambios para notificar
          const newTickets = res.tickets as Ticket[];
          newTickets.forEach((nt) => {
            const oldT = myTickets.find((t: Ticket) => t.id === nt.id);
            if (oldT && oldT.status === 'VALID' && nt.status === 'USED') {
              setNotifData({
                type: 'APPROVED',
                ticketType: nt.type,
                detail: nt.metadata?.detail || nt.type
              });
              setNotifShow(true);
              setTimeout(() => setNotifShow(false), 5000);
              if (viewingTicket?.id === nt.id) setViewingTicket(null);
            }
          });
          setTickets(newTickets);
        }
      } catch (e) {
        // Silently fail on network error during polling
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [currentUser.id, myTickets, setTickets, viewingTicket]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      <ValidationNotification
        show={notifShow}
        type={notifData.type || 'APPROVED'}
        ticketType={notifData.ticketType}
        detail={notifData.detail}
        onClose={() => setNotifShow(false)}
      />

      <div className="p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-blue-500 font-black">CP</span>
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none">
              <span className="text-blue-500">MIRA</span> SOLE
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">{currentUser?.name}</p>
          </div>
        </div>
        <button onClick={logout} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-red-400 active:scale-95 transition-all">
          <LogOut size={18} />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar pb-32">
        {myTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-600 italic">
            <TicketIcon className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-xs uppercase font-black tracking-widest">No tienes tickets</p>
          </div>
        ) : (
          <div className="space-y-5">
            {myTickets.map((ticket: Ticket) => {
              const event = events.find((e: EventSession) => e.id === ticket.eventId);
              const isUsed = ticket.status === TicketStatus.USED;
              return (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  key={ticket.id}
                  onClick={() => setViewingTicket(ticket)}
                  className={`group relative overflow-hidden rounded-[36px] border transition-all ${isUsed ? 'bg-black/40 border-white/5 opacity-50 grayscale' : 'bg-slate-800/40 border-white/10 shadow-2xl backdrop-blur-sm'
                    }`}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-black">{event?.name || 'Evento'}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">{ticket.metadata?.detail || ticket.type}</p>

                    <div className="mt-4 flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black ${isUsed ? 'bg-slate-700' : 'bg-blue-600'}`}>
                        {isUsed ? 'USADO' : 'ACTIVO'}
                      </span>
                      {!isUsed && <QrCode className="w-5 h-5 text-blue-500" />}
                      {isUsed && ticket.type === TicketType.DRINK && <GlassWater className="w-5 h-5 text-slate-500" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewingTicket && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed inset-0 z-50 bg-white flex flex-col text-black p-8"
          >
            <div className="flex justify-end">
              <button onClick={() => setViewingTicket(null)} className="p-4 font-black">CERRAR</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <QRCodeSVG value={`ticket:${viewingTicket.code}`} size={280} />
              <p className="mt-8 text-2xl font-black uppercase text-center">{viewingTicket.code}</p>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">{viewingTicket.status}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StaffView: React.FC<any> = ({
  opProfile, logout, events, selectedEventId, setSelectedEventId,
  animStatus, animReason, animDetails, setAnimStatus,
  activeMode, setActiveMode, cooldown, handleValidate
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <AnimationOverlay status={animStatus} reason={animReason} details={animDetails} onFinished={() => setAnimStatus(null)} />

      <div className="p-4 flex justify-between items-center border-b border-white/10">
        <button onClick={() => setSelectedEventId(null)} className="p-2 bg-white/10 rounded-full"><ChevronRight className="rotate-180" /></button>
        <h2 className="font-black uppercase">{opProfile}</h2>
        <button onClick={logout}><LogOut /></button>
      </div>

      {!selectedEventId ? (
        <div className="p-8 space-y-4">
          <h2 className="text-2xl font-black">EVENTOS</h2>
          {events.map((ev: EventSession) => (
            <button key={ev.id} onClick={() => setSelectedEventId(ev.id)} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10">
              <h3 className="font-bold text-lg">{ev.name}</h3>
              <p className="text-xs opacity-60">{ev.venue}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-8 items-center justify-center space-y-8">
          <select value={activeMode} onChange={e => setActiveMode(e.target.value)} className="bg-white/10 p-3 rounded-xl w-full font-bold text-white">
            {Object.values(OPERATION_MODES[opProfile as OperationType] || []).map(m => <option key={m.value} value={m.value} className='text-black'>{m.label}</option>)}
          </select>

          <div className="bg-black p-1 rounded-[40px] border-4 border-slate-700 shadow-2xl relative overflow-hidden">
            <QRScanner onScan={handleValidate} active={!animStatus && !cooldown} />
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">ESCANEA TICKET</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP PRINCIPAL ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [opProfile, setOpProfile] = useState<OperationType | null>(null);

  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<EventSession[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState('ENTRY');

  const [animStatus, setAnimStatus] = useState<'processing' | 'approved' | 'rejected' | null>(null);
  const [animReason, setAnimReason] = useState<string | undefined>(undefined);
  const [animDetails, setAnimDetails] = useState<string | undefined>(undefined);
  const [cooldown, setCooldown] = useState(false);

  const handleLogin = async (pin: string) => {
    try {
      const response = await api.login(pin);
      // Si hay una propiedad "data" en la respuesta, es el usuario
      // Si no la hay (ej: mock básico), asumir que response ES el usuario si tiene 'id'
      const userData = response.data || (response.id ? response : null);

      if (response.status === 'success' || userData) {
        const user = (response.data || response) as User; // Force cast compatible
        if (!user) throw new Error("Invalid User Data");

        setCurrentUser(user);
        setCurrentRole(user.role);
        setPinInput('');
        setError(null);

        // Cargar datos iniciales
        // Convertir role a string explícito si es necesario
        const initData = await api.getInitialData(user.id, String(user.role));
        if (initData) {
          setEvents(initData.events || []);
          setTickets(initData.tickets || []);
        }
      } else {
        setError('PIN Incorrecto');
        setPinInput('');
      }
    } catch (e) {
      setError('Error Login');
    }
  };

  const handleValidate = async (qrData: string) => {
    if (cooldown || animStatus) return;
    setAnimStatus('processing');

    // Simular delay visual
    await new Promise(r => setTimeout(r, 400));

    try {
      const code = qrData.replace('ticket:', '');
      const res = await api.validateTicket(code, selectedEventId || '', activeMode, currentUser?.id || '');

      if (res.status === 'success') {
        // Actualizar localmente el ticket
        setTickets(prev => prev.map(t =>
          t.code === code ? { ...t, status: TicketStatus.USED, usedAt: new Date().toISOString() } : t
        ));
        setAnimStatus('approved');
        setAnimDetails('VALIDADO OK');
      } else {
        setAnimStatus('rejected');
        setAnimReason(res.reason || 'ERROR');
        setAnimDetails(res.details || 'Ticket no válido');
      }
    } catch (e) {
      setAnimStatus('rejected');
      setAnimReason('NETWORK_ERROR');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setOpProfile(null);
    setSelectedEventId(null);
    setPinInput('');
    setEvents([]);
    setTickets([]);
  };

  if (!currentUser) {
    return (
      <LoginView
        pinInput={pinInput}
        setPinInput={setPinInput}
        error={error}
        handleLogin={handleLogin}
      />
    );
  }

  if (currentRole === UserRole.ASSISTANT) {
    return (
      <AssistantView
        currentUser={currentUser}
        logout={logout}
        myTickets={tickets}
        events={events}
        setTickets={setTickets}
      />
    );
  }

  if (!opProfile) {
    return <OperationSelector setOpProfile={setOpProfile} />;
  }

  return (
    <StaffView
      opProfile={opProfile}
      logout={logout}
      events={events}
      selectedEventId={selectedEventId}
      setSelectedEventId={setSelectedEventId}
      animStatus={animStatus}
      animReason={animReason}
      animDetails={animDetails}
      setAnimStatus={setAnimStatus}
      activeMode={activeMode}
      setActiveMode={setActiveMode}
      cooldown={cooldown}
      handleValidate={handleValidate}
      currentUser={currentUser}
    />
  );
};

export default App;
