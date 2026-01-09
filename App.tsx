
import React, { useState, useEffect, useRef } from 'react';
import { 
  OperationType, UserRole, TicketStatus, User, EventSession, Ticket, ScanAttempt, TicketType 
} from './types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_TICKETS } from './constants';
import { 
  QrCode, History, LayoutDashboard, LogOut, 
  MapPin, Moon, Sun, ShieldCheck, 
  Calendar, ChevronRight, UserCircle, 
  Zap, AlertTriangle, Wifi, WifiOff, Ticket as TicketIcon,
  GlassWater, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationOverlay } from './components/AnimationOverlay';
import { QRScanner } from './components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';

// --- Mappings for localized and operation-specific logic ---

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

const OPERATION_GATES = [
  { label: 'PUERTA A', value: 'GATE A' },
  { label: 'PUERTA B', value: 'GATE B' },
  { label: 'ACCESO SUR', value: 'SOUTH ACCESS' },
];

// --- Sub-components ---

const LoginView: React.FC<{
  pinInput: string;
  setPinInput: (val: string) => void;
  error: string | null;
  handleLogin: (pin: string) => void;
  selectAssistantMode: () => void;
}> = ({ pinInput, setPinInput, error, handleLogin, selectAssistantMode }) => {
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
        <button 
          onClick={selectAssistantMode}
          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/10 transition-all active:scale-95 text-slate-300"
        >
          <UserCircle className="w-6 h-6" /> SOY ASISTENTE
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-[#111827] px-4 text-slate-600 tracking-widest">O ACCESO STAFF</span></div>
        </div>

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
            <motion.p initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-red-500 text-center font-black text-sm uppercase tracking-wider">
              {error}
            </motion.p>
          )}
          <p className="text-center text-slate-500 text-[10px] uppercase font-black tracking-widest opacity-50">Ingrese su PIN de 4 dígitos</p>
        </div>
      </div>
    </div>
  );
};

const OperationSelector: React.FC<{ setOpProfile: (type: OperationType) => void }> = ({ setOpProfile }) => (
  <div className="min-h-screen flex flex-col p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
    <div className="mt-12 mb-10">
      <h1 className="text-xl font-black italic tracking-tighter mb-4">
        <span className="text-blue-500">MIRA</span> SOLE
      </h1>
      <h2 className="text-4xl font-black leading-tight tracking-tighter uppercase">MODO<br/>OPERATIVO</h2>
      <div className="h-1.5 w-16 bg-blue-600 mt-4 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
    </div>
    
    <div className="grid grid-cols-1 gap-5">
      {Object.values(OperationType).map((type) => (
        <motion.button
          whileTap={{ scale: 0.97 }}
          key={type}
          onClick={() => setOpProfile(type)}
          className="flex items-center justify-between p-7 bg-white/5 border border-white/10 rounded-[36px] shadow-2xl hover:bg-white/10 active:border-blue-500 transition-all group relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="text-left relative z-10">
            <span className="text-[10px] font-black text-blue-500 tracking-[0.3em] uppercase">PERFIL</span>
            <h3 className="text-2xl font-black mt-1 group-hover:text-blue-400 transition-colors tracking-tight">{type.replace('_', ' ')}</h3>
          </div>
          <div className="w-14 h-14 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all">
            <ChevronRight className="w-7 h-7 text-slate-500 group-hover:text-blue-500" />
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

// --- Main App ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [opProfile, setOpProfile] = useState<OperationType | null>(null);
  const [isNightMode, setIsNightMode] = useState(true); 
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [events, setEvents] = useState<EventSession[]>(MOCK_EVENTS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [scanLogs, setScanLogs] = useState<ScanAttempt[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeGate, setActiveGate] = useState('GATE A');
  const [activeMode, setActiveMode] = useState('ENTRY');

  const [animStatus, setAnimStatus] = useState<'processing' | 'approved' | 'rejected' | null>(null);
  const [animReason, setAnimReason] = useState<string | undefined>(undefined);
  const [animDetails, setAnimDetails] = useState<string | undefined>(undefined);

  const [scanCount, setScanCount] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (pin: string) => {
    const user = MOCK_USERS.find(u => u.pin === pin);
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role);
      setPinInput('');
      setError(null);
    } else {
      setError('PIN INCORRECTO');
      setPinInput('');
    }
  };

  const selectAssistantMode = () => {
    const assistant = MOCK_USERS.find(u => u.role === UserRole.ASSISTANT);
    if (assistant) {
      setCurrentUser(assistant);
      setCurrentRole(UserRole.ASSISTANT);
      setError(null);
    }
  };

  const handleValidate = async (qrData: string) => {
    if (cooldown || animStatus) return;

    setScanCount(prev => prev + 1);
    if (scanCount > 10) {
      setCooldown(true);
      setTimeout(() => { setCooldown(false); setScanCount(0); }, 30000);
      setAnimStatus('rejected');
      setAnimReason('RATE LIMIT');
      setAnimDetails('Demasiados escaneos. Espera 30s.');
      return;
    }

    setAnimStatus('processing');
    await new Promise(r => setTimeout(r, 600));

    if (isOffline) {
      setAnimStatus('rejected');
      setAnimReason('SIN CONEXIÓN');
      setAnimDetails('Validación bloqueada por seguridad.');
      return;
    }

    const code = qrData.replace('ticket:', '');
    const ticket = tickets.find(t => t.code === code);

    if (!ticket) {
      logScan(code, 'REJECTED', 'NOT_FOUND');
      setAnimStatus('rejected');
      setAnimReason('NO VÁLIDO');
    } else if (ticket.eventId !== selectedEventId) {
      logScan(code, 'REJECTED', 'WRONG_EVENT');
      setAnimStatus('rejected');
      setAnimReason('EVENTO INCORRECTO');
    } else if (ticket.status === TicketStatus.BLOCKED) {
      logScan(code, 'REJECTED', 'BLOCKED');
      setAnimStatus('rejected');
      setAnimReason('BLOQUEADO');
    } else if (ticket.status === TicketStatus.USED) {
      logScan(code, 'REJECTED', 'USED');
      setAnimStatus('rejected');
      setAnimReason('YA USADO');
      setAnimDetails(`${ticket.usedInMode} - ${new Date(ticket.usedAt!).toLocaleTimeString()}`);
    } else {
      const updatedTickets = tickets.map(t => 
        t.id === ticket.id 
        ? { 
            ...t, 
            status: TicketStatus.USED, 
            usedAt: new Date().toISOString(), 
            usedInMode: activeMode,
            usedByDeviceId: 'DEVICE-01'
          } 
        : t
      );
      setTickets(updatedTickets);
      logScan(code, 'APPROVED');
      setAnimStatus('approved');
      setAnimDetails(`${ticket.type} - VALIDADO`);
    }
  };

  const logScan = (code: string, result: 'APPROVED' | 'REJECTED', reason?: string) => {
    const log: ScanAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      deviceId: 'DEVICE-01',
      staffUserId: currentUser?.id || 'ANONYMOUS',
      codeHash: btoa(code),
      result,
      reason,
      operationType: opProfile || OperationType.BOLICHE,
      mode: activeMode,
      gate: activeGate,
      eventId: selectedEventId || 'none'
    };
    setScanLogs(prev => [log, ...prev].slice(0, 50));
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setOpProfile(null);
    setSelectedEventId(null);
    setPinInput('');
    setError(null);
  };

  if (!currentUser) {
    return (
      <LoginView 
        pinInput={pinInput} 
        setPinInput={setPinInput} 
        error={error} 
        handleLogin={handleLogin} 
        selectAssistantMode={selectAssistantMode} 
      />
    );
  }

  if (currentRole === UserRole.ASSISTANT) {
    const myTickets = tickets.filter(t => t.ownerUserId === currentUser?.id);
    return (
      <AssistantView 
        currentUser={currentUser} 
        logout={logout} 
        myTickets={myTickets} 
        events={events} 
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
      isNightMode={isNightMode} 
      setIsNightMode={setIsNightMode}
      isOffline={isOffline}
      animStatus={animStatus}
      animReason={animReason}
      animDetails={animDetails}
      setAnimStatus={setAnimStatus}
      setAnimReason={setAnimReason}
      setAnimDetails={setAnimDetails}
      activeGate={activeGate}
      setActiveGate={setActiveGate}
      activeMode={activeMode}
      setActiveMode={setActiveMode}
      cooldown={cooldown}
      handleValidate={handleValidate}
      scanLogs={scanLogs}
      currentUser={currentUser}
    />
  );
};

// --- View Implementations ---

const AssistantView: React.FC<any> = ({ currentUser, logout, myTickets, events }) => {
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);

  const getTicketIcon = (type: TicketType) => {
    if (type === TicketType.DRINK || type === TicketType.POPCORN) return <GlassWater className="w-5 h-5" />;
    return <QrCode className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
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
        <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-3">Dashboard Usuario</p>
          <h2 className="text-3xl font-black tracking-tighter leading-tight">Hola,<br/>{currentUser?.name.split(' ')[0]}.</h2>
          <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest opacity-80">Salta • {myTickets.length} tickets activos</p>
        </div>

        <div className="flex items-center justify-between px-2">
           <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Tus Accesos</h3>
           <div className="h-px flex-1 bg-white/5 mx-4"></div>
        </div>

        {myTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-600 italic">
            <TicketIcon className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-xs uppercase font-black tracking-widest">No tienes tickets</p>
          </div>
        ) : (
          <div className="space-y-5">
            {myTickets.map(ticket => {
              const event = events.find(e => e.id === ticket.eventId);
              const isUsed = ticket.status === TicketStatus.USED;
              const isDrink = ticket.type === TicketType.DRINK;

              return (
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  key={ticket.id} 
                  onClick={() => setViewingTicket(ticket)}
                  className={`group relative overflow-hidden rounded-[36px] border transition-all ${
                    isUsed ? 'bg-black/40 border-white/5 opacity-50 grayscale' : 'bg-slate-800/40 border-white/10 shadow-2xl backdrop-blur-sm'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                            ticket.status === TicketStatus.VALID ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-slate-700 text-slate-400'
                          }`}>
                            {isUsed ? 'USADO' : 'ACTIVO'}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isDrink ? 'text-amber-500' : 'text-blue-500'}`}>
                            {isDrink ? 'CONSUMICIÓN' : 'ENTRY'}
                          </span>
                        </div>
                        <h3 className="text-xl font-black leading-tight mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{event?.name || 'Evento'}</h3>
                        <p className="text-[10px] font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                          <MapPin size={10} className="text-blue-500" /> {event?.venue || 'Salta'}
                        </p>
                      </div>
                      
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${
                        isUsed ? 'bg-white/5' : isDrink ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-blue-500/10 text-blue-500 border border-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                      }`}>
                        {getTicketIcon(ticket.type)}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">CÓDIGO DIGITAL</p>
                        <p className="text-xs font-black text-white uppercase tracking-tighter">
                          {ticket.metadata?.detail || (isDrink ? 'BEBIDA' : 'ACCESO')}
                        </p>
                      </div>
                      
                      {!isUsed ? (
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20 active:scale-90 transition-all">
                          <span className="text-[10px] font-black uppercase tracking-widest">VER QR</span>
                          <ChevronRight size={12} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <ShieldCheck size={14} className="text-slate-600" />
                           <p className="text-[9px] font-black text-slate-600 uppercase italic">Ya Validado</p>
                        </div>
                      )}
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
              <button onClick={() => setViewingTicket(null)} className="p-4 text-slate-400 font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all">Cerrar [X]</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center mb-10">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.6em] mb-4 block leading-none">Identificador Digital</span>
                <h2 className="text-4xl font-black mb-2 leading-tight tracking-tighter uppercase">{events.find(e => e.id === viewingTicket.eventId)?.name}</h2>
                <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full mb-4"></div>
                <p className="font-bold text-slate-400 uppercase tracking-[0.3em] text-[10px]">{viewingTicket.metadata?.detail || viewingTicket.type}</p>
              </div>
              
              <div className="p-8 bg-white border-[16px] border-black rounded-[60px] mb-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative group">
                <div className="absolute -top-5 -left-5 w-10 h-10 bg-white rounded-full border-4 border-black"></div>
                <div className="absolute -top-5 -right-5 w-10 h-10 bg-white rounded-full border-4 border-black"></div>
                <div className="absolute -bottom-5 -left-5 w-10 h-10 bg-white rounded-full border-4 border-black"></div>
                <div className="absolute -bottom-5 -right-5 w-10 h-10 bg-white rounded-full border-4 border-black"></div>
                <QRCodeSVG value={`ticket:${viewingTicket.code}`} size={240} level="H" includeMargin={false} className="group-hover:scale-105 transition-transform duration-500" />
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-3 px-8 py-3.5 bg-slate-50 border border-slate-100 rounded-full shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                  <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">VALIDACIÓN SEGURA</p>
                </div>
                
                <p className="text-[10px] text-center text-slate-400 italic font-bold uppercase tracking-[0.1em] px-12 leading-relaxed opacity-60">
                  Salta • {new Date().toLocaleDateString()} • {viewingTicket.id.toUpperCase()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StaffView: React.FC<any> = ({ 
  opProfile, logout, events, selectedEventId, setSelectedEventId, 
  isNightMode, setIsNightMode, isOffline, animStatus, animReason, animDetails,
  setAnimStatus, setAnimReason, setAnimDetails, activeGate, setActiveGate,
  activeMode, setActiveMode, cooldown, handleValidate, scanLogs, currentUser
}) => {
  const [view, setView] = useState<'scan' | 'history' | 'dashboard'>('scan');
  const filteredEvents = events.filter(e => e.operationType === opProfile);
  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Styling helpers based on theme
  const themeClasses = isNightMode 
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white" 
    : "bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900";
  
  const cardClasses = isNightMode 
    ? "bg-white/5 border-white/10" 
    : "bg-white border-slate-200 shadow-xl";
  
  const textPrimary = isNightMode ? "text-white" : "text-slate-900";
  const textSecondary = isNightMode ? "text-slate-400" : "text-slate-500";
  const headerBg = isNightMode ? "bg-black/40 backdrop-blur-xl border-white/5" : "bg-white/80 backdrop-blur-xl border-slate-200";

  // Filter modes based on operation type
  const availableModes = OPERATION_MODES[opProfile as OperationType] || [];

  if (!selectedEventId) {
    return (
      <div className={`min-h-screen p-8 flex flex-col ${themeClasses}`}>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className={`text-xl font-black italic tracking-tighter leading-none mb-1 ${textPrimary}`}>
              <span className="text-blue-500">MIRA</span> SOLE
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">{opProfile?.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} className={`p-4 rounded-3xl active:scale-95 transition-all flex items-center justify-center ${cardClasses}`}>
            <LogOut size={20} className="text-red-500" />
          </button>
        </div>

        <div className="mb-10">
          <h2 className={`text-4xl font-black tracking-tighter leading-none mb-2 ${textPrimary}`}>SESIONES</h2>
          <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${textSecondary}`}>SELECCIONA EVENTO ACTIVO</p>
          <div className="h-1.5 w-12 bg-blue-600 mt-4 rounded-full"></div>
        </div>
        
        <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar pb-10">
          {filteredEvents.map(ev => (
            <motion.button 
              whileTap={{ scale: 0.98 }}
              key={ev.id} 
              onClick={() => setSelectedEventId(ev.id)}
              className={`w-full p-8 rounded-[40px] border text-left transition-all group relative overflow-hidden ${cardClasses}`}
            >
              <h3 className={`text-2xl font-black tracking-tight leading-tight mb-2 group-hover:text-blue-500 transition-colors ${textPrimary}`}>{ev.name}</h3>
              <p className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider mb-6 ${textSecondary}`}>
                <MapPin size={12} className="text-blue-500" /> {ev.venue}
              </p>
              
              <div className="flex items-center justify-between">
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${isNightMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                  LISTO PARA VALIDAR
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isNightMode ? 'bg-white/5 border-white/5 group-hover:border-blue-500' : 'bg-slate-50 border-slate-100 group-hover:border-blue-300'}`}>
                   <ChevronRight className={`w-6 h-6 transition-all ${isNightMode ? 'text-slate-500 group-hover:text-blue-500' : 'text-slate-400 group-hover:text-blue-600'}`} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses}`}>
      <AnimationOverlay 
        status={animStatus} 
        reason={animReason} 
        details={animDetails} 
        onFinished={() => {
          setAnimStatus(null);
          setAnimReason(undefined);
          setAnimDetails(undefined);
        }} 
      />

      <div className={`p-4 border-b flex items-center justify-between sticky top-0 z-40 transition-colors duration-500 ${headerBg}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={() => setSelectedEventId(null)} className={`p-2.5 rounded-2xl border active:scale-90 transition-all ${cardClasses}`}>
            <ChevronRight size={20} className={`rotate-180 ${textPrimary}`} />
          </button>
          <div className="overflow-hidden">
            <h2 className={`text-[11px] font-black truncate uppercase tracking-tight leading-none mb-1 ${textPrimary}`}>{selectedEvent?.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-blue-500">{activeGate}</span>
              <span className={`text-[9px] font-black ${textSecondary}`}>•</span>
              <span className="text-[9px] font-black uppercase text-purple-500">{availableModes.find(m => m.value === activeMode)?.label || activeMode}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOffline ? <WifiOff size={18} className="text-red-500" /> : <Wifi size={18} className="text-green-500" />}
          <button onClick={() => setIsNightMode(!isNightMode)} className={`p-2.5 rounded-2xl border active:scale-95 transition-all ${cardClasses}`}>
            {isNightMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-blue-600" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'scan' && (
          <div className="flex-1 flex flex-col p-8 space-y-8">
            {/* Custom Styled Selects */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 ${textSecondary}`}>Punto de Control</label>
                <div className="relative group">
                  <select 
                    className={`w-full px-5 py-4 border rounded-[28px] text-[11px] font-black appearance-none outline-none uppercase tracking-tight shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                      isNightMode ? 'bg-slate-800/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                    value={activeMode}
                    onChange={(e) => setActiveMode(e.target.value)}
                  >
                    {availableModes.map(m => (
                      <option key={m.value} value={m.value} className="bg-slate-900 text-white">{m.label}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90 transition-opacity group-hover:opacity-100 opacity-40 ${textPrimary}`} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 ${textSecondary}`}>Ubicación / Gate</label>
                <div className="relative group">
                  <select 
                    className={`w-full px-5 py-4 border rounded-[28px] text-[11px] font-black appearance-none outline-none uppercase tracking-tight shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                      isNightMode ? 'bg-slate-800/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                    value={activeGate}
                    onChange={(e) => setActiveGate(e.target.value)}
                  >
                    {OPERATION_GATES.map(g => (
                      <option key={g.value} value={g.value} className="bg-slate-900 text-white">{g.label}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90 transition-opacity group-hover:opacity-100 opacity-40 ${textPrimary}`} />
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative px-2">
              {cooldown ? (
                <div className="w-full aspect-square bg-red-500/5 rounded-[60px] flex flex-col items-center justify-center text-red-500 p-10 text-center border-2 border-dashed border-red-500/20">
                  <AlertTriangle size={64} className="mb-4 animate-bounce" />
                  <h3 className="text-2xl font-black">RATE LIMIT</h3>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest leading-relaxed">Demasiados escaneos. Espera 30s.</p>
                </div>
              ) : (
                <div className="w-full max-w-sm aspect-square relative group">
                  <QRScanner onScan={handleValidate} active={view === 'scan'} />
                  <div className={`absolute -top-4 -right-4 flex items-center gap-2 backdrop-blur-3xl px-6 py-3 rounded-full text-[10px] font-black border shadow-2xl ${
                    isNightMode ? 'bg-black/80 text-white border-white/10' : 'bg-white/90 text-slate-900 border-slate-100'
                  }`}>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div> 
                    <span className="tracking-[0.2em]">SYNC ACTIVE</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center pb-8">
              <div className="flex items-center justify-center gap-3 opacity-40">
                <div className={`h-px w-8 ${isNightMode ? 'bg-white' : 'bg-slate-900'}`}></div>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${textPrimary}`}>Lectura Activa</p>
                <div className={`h-px w-8 ${isNightMode ? 'bg-white' : 'bg-slate-900'}`}></div>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="flex-1 p-8 overflow-y-auto no-scrollbar space-y-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className={`text-3xl font-black tracking-tighter ${textPrimary}`}>AUDITORÍA</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${textSecondary}`}>Últimos Escaneos</p>
              </div>
              <span className="text-[10px] font-black bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg">{scanLogs.length} LOGS</span>
            </div>
            
            {scanLogs.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-32 opacity-20 ${textPrimary}`}>
                <History size={60} className="mb-4" />
                <p className="font-black text-sm uppercase tracking-[0.5em]">Sin Actividad</p>
              </div>
            ) : (
              scanLogs.map(log => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={log.id} 
                  className={`p-6 rounded-[36px] border flex items-center justify-between ${cardClasses}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${log.result === 'APPROVED' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.7)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]'}`}></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${log.result === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {log.result}
                        </span>
                        <p className={`text-[11px] font-black uppercase truncate max-w-[120px] ${textPrimary}`}>{log.mode}</p>
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest opacity-40 ${textPrimary}`}>GATE: {log.gate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black tracking-tighter ${textSecondary}`}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {view === 'dashboard' && (
          <div className="flex-1 p-8 overflow-y-auto no-scrollbar space-y-8 pb-10">
            <h3 className={`text-3xl font-black tracking-tighter ${textPrimary}`}>MÉTRICAS</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-[40px] border relative overflow-hidden ${isNightMode ? 'bg-green-500/5 border-green-500/10' : 'bg-green-50 border-green-100'}`}>
                <CheckCircle2 size={40} className="text-green-500/20 absolute -right-2 -top-2" />
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">OK</p>
                <p className={`text-5xl font-black ${isNightMode ? 'text-green-500' : 'text-green-600'}`}>
                  {scanLogs.filter(l => l.result === 'APPROVED').length}
                </p>
              </div>
              <div className={`p-6 rounded-[40px] border relative overflow-hidden ${isNightMode ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'}`}>
                <XCircle size={40} className="text-red-500/20 absolute -right-2 -top-2" />
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">FAIL</p>
                <p className={`text-5xl font-black ${isNightMode ? 'text-red-500' : 'text-red-600'}`}>
                  {scanLogs.filter(l => l.result === 'REJECTED').length}
                </p>
              </div>
            </div>

            <div className={`p-8 rounded-[40px] border ${cardClasses}`}>
              <h4 className={`text-[10px] font-black uppercase text-center mb-8 tracking-[0.4em] ${textSecondary}`}>CAUSAS RECHAZO</h4>
              <div className="space-y-6">
                {['USED', 'WRONG_EVENT', 'NOT_FOUND', 'RATE_LIMIT'].map(reason => {
                  const count = scanLogs.filter(l => l.reason === reason).length;
                  const total = scanLogs.filter(l => l.result === 'REJECTED').length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={reason}>
                      <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-tight">
                        <span className={textSecondary}>{reason.replace('_', ' ')}</span>
                        <span className={textPrimary}>{count} <span className="text-[9px] opacity-40 ml-1">({pct}%)</span></span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isNightMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full bg-red-500 ${pct > 0 ? 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}`}></motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 bg-blue-600 text-white rounded-[44px] shadow-2xl shadow-blue-500/30 overflow-hidden relative">
               <Zap size={140} className="absolute -bottom-10 -right-10 opacity-10" />
               <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight">SYSTEM ACTIVE</h4>
                    <p className="text-[9px] font-black uppercase opacity-60">Sincronización Regional OK</p>
                  </div>
                </div>
                <div className="flex gap-6 mt-8">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black opacity-60 uppercase mb-1">Latencia</span>
                    <span className="text-sm font-black tracking-tighter">42 MS</span>
                  </div>
                  <div className="flex flex-col border-l border-white/20 pl-6">
                    <span className="text-[8px] font-black opacity-60 uppercase mb-1">Status</span>
                    <span className="text-sm font-black tracking-tighter">OPTIMAL</span>
                  </div>
                </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Staff Nav Bottom */}
      <div className={`p-4 border-t flex items-center justify-around pb-12 sticky bottom-0 z-40 transition-colors duration-500 ${headerBg}`}>
        <button 
          onClick={() => setView('scan')} 
          className={`flex flex-col items-center gap-2 group transition-all ${view === 'scan' ? 'text-blue-500 scale-110' : textSecondary}`}
        >
          <div className={`p-4 rounded-[28px] border transition-all ${view === 'scan' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-transparent border-transparent group-active:bg-slate-500/10'}`}>
            <QrCode size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cámara</span>
        </button>
        <button 
          onClick={() => setView('history')} 
          className={`flex flex-col items-center gap-2 group transition-all ${view === 'history' ? 'text-blue-500 scale-110' : textSecondary}`}
        >
          <div className={`p-4 rounded-[28px] border transition-all ${view === 'history' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-transparent border-transparent group-active:bg-slate-500/10'}`}>
            <History size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Auditar</span>
        </button>
        <button 
          onClick={() => setView('dashboard')} 
          className={`flex flex-col items-center gap-2 group transition-all ${view === 'dashboard' ? 'text-blue-500 scale-110' : textSecondary}`}
        >
          <div className={`p-4 rounded-[28px] border transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-transparent border-transparent group-active:bg-slate-500/10'}`}>
            <LayoutDashboard size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Stats</span>
        </button>
      </div>
    </div>
  );
};

export default App;
