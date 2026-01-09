import React, { useState, useEffect, useRef } from 'react';
import {
  OperationType, UserRole, TicketStatus, User, EventSession, Ticket, TicketType
} from './types';
import {
  QrCode, LogOut, ChevronRight, Ticket as TicketIcon, GlassWater, UserCircle
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
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed inset-0 z-50 bg-white text-black flex flex-col"
          >
            <div className="p-6 flex justify-end">
              <button onClick={() => setViewingTicket(null)} className="text-xs font-black uppercase tracking-widest text-slate-400 px-4 py-2">
                CERRAR [X]
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Identificador Digital</p>
                <h2 className="text-4xl font-black italic tracking-tighter leading-none">{events.find((e: any) => e.id === viewingTicket.eventId)?.name}</h2>
                <div className="w-12 h-1 bg-blue-600 mx-auto mt-4 rounded-full" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-4">{viewingTicket.metadata?.detail}</p>
              </div>

              <div className="p-4 bg-white rounded-[40px] shadow-2xl border-4 border-black relative">
                {/* Decorative corners */}
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-white border-4 border-black rounded-full z-10" />
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-white border-4 border-black rounded-full z-10" />
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white border-4 border-black rounded-full z-10" />
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-4 border-black rounded-full z-10" />

                <QRCodeSVG value={`ticket:${viewingTicket.code}`} size={240} className="relative z-0" />
              </div>

              <div className="px-6 py-3 bg-slate-100 rounded-full flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Validación Segura</span>
              </div>
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
  // ... STAFF VIEW IMPLEMENTATION SIMPLIFIED FOR LENGTH BUT FUNCTIONAL ...
  // (Mantengo la estructura funcional de Staff, que al ser interna no es el foco del reclamo estético principal del "Dashboard Usuario", pero le doy un toque de estilo coherente)
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white selection:bg-blue-500/30">
      <AnimationOverlay status={animStatus} reason={animReason} details={animDetails} onFinished={() => setAnimStatus(null)} />
      <div className="p-4 flex justify-between items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => setSelectedEventId(null)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-95"><ChevronRight className="rotate-180" size={20} /></button>
        <div className="text-center">
          <h2 className="font-black uppercase text-sm tracking-widest text-blue-500">{opProfile}</h2>
          <p className="text-[10px] text-slate-500 font-bold">STAFF: {currentUser?.name}</p>
        </div>
        <button onClick={logout} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20"><LogOut size={16} /></button>
      </div>

      {!selectedEventId ? (
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black italic tracking-tighter mb-6">SELECCIONAR EVENTO</h2>
          {events.map((ev: EventSession) => (
            <button key={ev.id} onClick={() => setSelectedEventId(ev.id)} className="w-full p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl text-left hover:border-blue-500/50 transition-all shadow-xl">
              <h3 className="font-bold text-lg text-white mb-1">{ev.name}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{ev.venue}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-6 items-center justify-center space-y-8">
          <div className="w-full space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Modo Validación</label>
            <select value={activeMode} onChange={e => setActiveMode(e.target.value)} className="w-full bg-slate-800 p-4 rounded-2xl font-bold text-white border border-slate-700 outline-none focus:border-blue-500 appearance-none">
              {Object.values(OPERATION_MODES[opProfile as OperationType] || []).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="bg-black p-2 rounded-[44px] border-4 border-slate-700 shadow-2xl relative">
            <div className="rounded-[36px] overflow-hidden border border-white/20 relative w-[300px] h-[400px]">
              <QRScanner onScan={handleValidate} active={!animStatus && !cooldown} />

              {/* Overlay Scanner UI */}
              <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none"></div>
              <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
                <span className="px-3 py-1 bg-black/60 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md">Escaneando...</span>
              </div>
            </div>
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
