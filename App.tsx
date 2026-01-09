
import React, { useState, useEffect, useRef } from 'react';
import { 
  OperationType, UserRole, TicketStatus, User, EventSession, Ticket, ScanAttempt, TicketType 
} from './types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_TICKETS } from './constants';
import { 
  QrCode, Users, LayoutDashboard, History, Settings, LogOut, 
  MapPin, Clock, Moon, Sun, Smartphone, ShieldCheck, 
  Calendar, CreditCard, ChevronRight, UserCircle, 
  Zap, AlertTriangle, Wifi, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationOverlay } from './components/AnimationOverlay';
import { QRScanner } from './components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';

// --- Sub-components moved outside to prevent remounting/focus loss ---

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
             {/* Visual representation of PIN dots */}
             {[0, 1, 2, 3].map((i) => (
               <div key={i} className={`w-12 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${pinInput.length > i ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-black'}`}>
                  {pinInput.length > i && <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>}
               </div>
             ))}
             {/* Invisible real input for better focus and keyboard handling */}
             <input 
              ref={inputRef}
              type="tel" // Use tel for numeric keypad on mobile
              autoFocus
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); // Only digits
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
  <div className="min-h-screen flex flex-col p-6 bg-slate-50">
    <div className="mt-12 mb-8">
      <h2 className="text-3xl font-black leading-tight">PERFIL DE<br/>OPERACIÓN</h2>
      <div className="h-1 w-12 bg-blue-600 mt-2"></div>
    </div>
    
    <div className="grid grid-cols-1 gap-4">
      {Object.values(OperationType).map((type) => (
        <button
          key={type}
          onClick={() => setOpProfile(type)}
          className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-blue-500 active:scale-[0.98] transition-all group"
        >
          <div className="text-left">
            <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">MODO</span>
            <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{type.replace('_', ' ')}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
          </div>
        </button>
      ))}
    </div>
  </div>
);

// --- Main App ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [opProfile, setOpProfile] = useState<OperationType | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // App Data
  const [events, setEvents] = useState<EventSession[]>(MOCK_EVENTS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [scanLogs, setScanLogs] = useState<ScanAttempt[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeGate, setActiveGate] = useState('ENTRADA 1');
  const [activeMode, setActiveMode] = useState('ENTRY');

  // Animation Control
  const [animStatus, setAnimStatus] = useState<'processing' | 'approved' | 'rejected' | null>(null);
  const [animReason, setAnimReason] = useState<string | undefined>(undefined);
  const [animDetails, setAnimDetails] = useState<string | undefined>(undefined);

  // Rate Limiting Logic
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

  // --- Render logic ---

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
    // Assistant View remains largely same, just extracted or inline
    const myTickets = tickets.filter(t => t.ownerUserId === currentUser?.id);
    return (
      <AssistantView 
        isNightMode={isNightMode} 
        setIsNightMode={setIsNightMode} 
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

// --- View Implementation Parts (moved out to prevent remounting) ---

const AssistantView: React.FC<any> = ({ isNightMode, setIsNightMode, currentUser, logout, myTickets, events }) => {
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);

  return (
    <div className={`min-h-screen flex flex-col ${isNightMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black">MIS TICKETS</h1>
          <p className="text-xs font-bold text-blue-500 uppercase">{currentUser?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNightMode(!isNightMode)} className="p-2 rounded-xl bg-slate-200 dark:bg-white/10">
            {isNightMode ? <Sun /> : <Moon />}
          </button>
          <button onClick={logout} className="p-2 rounded-xl bg-red-100 text-red-600">
            <LogOut />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-24">
        {myTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic">
            <Smartphone className="w-12 h-12 mb-4 opacity-20" />
            <p>No tienes tickets disponibles</p>
          </div>
        ) : (
          myTickets.map(ticket => {
            const event = events.find(e => e.id === ticket.eventId);
            return (
              <div 
                key={ticket.id} 
                onClick={() => setViewingTicket(ticket)}
                className={`p-5 rounded-3xl border-2 transition-all active:scale-[0.97] ${
                  isNightMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      ticket.status === TicketStatus.VALID ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'
                    }`}>
                      {ticket.status}
                    </span>
                    <h3 className="text-lg font-bold mt-2">{event?.name || 'Evento'}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {event?.venue}
                    </p>
                  </div>
                  <div className="bg-blue-500/10 p-2 rounded-xl">
                    <CreditCard className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                    <Clock className="w-3 h-3" /> HOY - 23:30HS
                  </div>
                  <div className="font-black text-sm uppercase tracking-tighter text-blue-500">
                    {ticket.type}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {viewingTicket && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed inset-0 z-50 bg-white flex flex-col text-black p-8"
          >
            <div className="flex justify-end">
              <button onClick={() => setViewingTicket(null)} className="p-4 text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Cerrar [X]</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 leading-tight">{events.find(e => e.id === viewingTicket.eventId)?.name}</h2>
                <p className="font-bold text-blue-600 uppercase tracking-[0.3em] text-sm">{viewingTicket.type}</p>
              </div>
              
              <div className="p-6 bg-white border-[12px] border-black rounded-[40px] mb-10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)]">
                <QRCodeSVG value={`ticket:${viewingTicket.code}`} size={240} level="H" includeMargin={false} />
              </div>
              
              <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-full">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Código Dinámico Encriptado</p>
              </div>
              
              <p className="mt-12 text-[10px] text-center text-slate-400 italic font-bold uppercase tracking-[0.1em] px-12 leading-relaxed">
                Presente este código en puerta. Use brillo máximo.
              </p>
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

  if (!selectedEventId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-black">{opProfile?.replace('_', ' ')}</h1>
            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Selector de Sesión</p>
          </div>
          <button onClick={logout} className="p-3 bg-white border border-slate-200 text-red-600 rounded-2xl shadow-sm"><LogOut size={20} /></button>
        </div>
        
        <div className="space-y-4">
          {filteredEvents.map(ev => (
            <button 
              key={ev.id} 
              onClick={() => setSelectedEventId(ev.id)}
              className="w-full p-6 bg-white rounded-3xl border border-slate-200 text-left shadow-sm active:scale-95 transition-all group hover:border-blue-500"
            >
              <h3 className="text-xl font-black group-hover:text-blue-600 transition-colors">{ev.name}</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">{ev.venue}</p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
                  <Calendar className="w-3.5 h-3.5" /> HOY
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isNightMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
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

      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#0a0a0a] sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={() => setSelectedEventId(null)} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"><ChevronRight size={18} className="rotate-180" /></button>
          <div className="overflow-hidden">
            <h2 className="text-xs font-black truncate uppercase tracking-tight">{selectedEvent?.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-black uppercase text-blue-500 whitespace-nowrap">{activeGate}</span>
              <span className="text-[9px] font-black text-slate-300">/</span>
              <span className="text-[9px] font-black uppercase text-purple-500 whitespace-nowrap">{activeMode}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {isOffline ? <WifiOff className="text-red-500 w-4 h-4" /> : <Wifi className="text-green-500 w-4 h-4" />}
          <button onClick={() => setIsNightMode(!isNightMode)} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {isNightMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'scan' && (
          <div className="flex-1 flex flex-col p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1">
                <select 
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black appearance-none outline-none uppercase tracking-widest shadow-sm"
                  value={activeMode}
                  onChange={(e) => setActiveMode(e.target.value)}
                >
                  <option value="ENTRY">PUERTA / ENTRADA</option>
                  <option value="VIP">ACCESO VIP</option>
                  <option value="DRINK">BARRA / BEBIDA</option>
                  <option value="POPCORN">BAR / CINE</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><ChevronRight size={14} className="rotate-90" /></div>
              </div>
              <div className="relative flex-1">
                <select 
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black appearance-none outline-none uppercase tracking-widest shadow-sm"
                  value={activeGate}
                  onChange={(e) => setActiveGate(e.target.value)}
                >
                  <option value="GATE A">GATE A</option>
                  <option value="GATE B">GATE B</option>
                  <option value="MAIN ACCESS">ACCESO PPAL</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><ChevronRight size={14} className="rotate-90" /></div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              {cooldown ? (
                <div className="w-full aspect-square bg-red-500/5 rounded-[40px] flex flex-col items-center justify-center text-red-500 p-8 text-center border-2 border-dashed border-red-500/20">
                  <AlertTriangle className="w-12 h-12 mb-4 animate-bounce" />
                  <h3 className="text-xl font-black tracking-tight">PROTECCIÓN ACTIVA</h3>
                  <p className="mt-2 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Escaneo bloqueado por 30 segundos debido a actividad inusual.</p>
                </div>
              ) : (
                <div className="w-full max-w-xs aspect-square relative group">
                  <QRScanner onScan={handleValidate} active={view === 'scan'} />
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-lg px-3 py-1.5 rounded-full text-[9px] font-black text-white border border-white/10">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> SYNC OK
                  </div>
                </div>
              )}
            </div>

            <div className="text-center pb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Escaneando automáticamente...</p>
              <p className="mt-2 text-[9px] text-slate-300 uppercase font-bold">Atomic Core Engine v4.0</p>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-3">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-black tracking-tight uppercase">AUDITORÍA LIVE</h3>
               <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-1 rounded-md">{scanLogs.length} RECIENTES</span>
             </div>
            {scanLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-20">
                <History size={40} className="mb-2" />
                <p className="font-black text-xs uppercase tracking-widest">Sin actividad</p>
              </div>
            ) : (
              scanLogs.map(log => (
                <div key={log.id} className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isNightMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${log.result === 'APPROVED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">
                        {log.mode} - {log.gate}
                      </p>
                      <p className={`text-[9px] font-bold uppercase ${log.result === 'APPROVED' ? 'text-green-500' : 'text-red-500'}`}>
                        {log.result} {log.reason ? `• ${log.reason}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'dashboard' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight">RENDIMIENTO SESIÓN</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-[32px]">
                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1 opacity-60">ÉXITO</p>
                <p className="text-4xl font-black text-green-600 leading-none">{scanLogs.filter(l => l.result === 'APPROVED').length}</p>
              </div>
              <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-[32px]">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1 opacity-60">RECHAZO</p>
                <p className="text-4xl font-black text-red-600 leading-none">{scanLogs.filter(l => l.result === 'REJECTED').length}</p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-white/5 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-[0.2em] text-center">ANÁLISIS DE INCIDENCIAS</h4>
              <div className="space-y-4">
                {['USED', 'WRONG_EVENT', 'NOT_FOUND', 'RATE_LIMIT'].map(reason => {
                  const count = scanLogs.filter(l => l.reason === reason).length;
                  const total = scanLogs.filter(l => l.result === 'REJECTED').length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={reason}>
                      <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase tracking-tighter">
                        <span className="text-slate-500">{reason}</span>
                        <span className="text-slate-800 dark:text-white">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full ${pct > 0 ? 'bg-red-500' : 'bg-slate-300 opacity-20'}`}></motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-blue-600 text-white rounded-[32px] shadow-2xl shadow-blue-500/30 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
               <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-70">ESTADO RED</h4>
                <div className="flex items-center gap-2 mb-3">
                  <Wifi className="w-5 h-5" />
                  <p className="text-lg font-black uppercase">SINCRONIZADO</p>
                </div>
                <p className="text-[10px] font-bold opacity-80 uppercase leading-relaxed tracking-tight">
                  LATENCIA: 42MS • SERVIDORES: OK • CLUSTERS: ACTIVE
                </p>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/10 flex items-center justify-around pb-8 sticky bottom-0 z-40">
        <button 
          onClick={() => setView('scan')} 
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'scan' ? 'text-blue-500 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${view === 'scan' ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}><QrCode size={22} /></div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Cámara</span>
        </button>
        <button 
          onClick={() => setView('history')} 
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'history' ? 'text-blue-500 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${view === 'history' ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}><History size={22} /></div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Auditar</span>
        </button>
        <button 
          onClick={() => setView('dashboard')} 
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'dashboard' ? 'text-blue-500 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${view === 'dashboard' ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}><LayoutDashboard size={22} /></div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Stats</span>
        </button>
      </div>
    </div>
  );
};

export default App;
