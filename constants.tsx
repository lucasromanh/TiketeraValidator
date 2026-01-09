
import { OperationType, UserRole, TicketType, TicketStatus, User, EventSession, Ticket } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Celeste Peralta',
    email: 'celeste@test.com',
    role: UserRole.ASSISTANT,
    isActive: true
  },
  {
    id: 's1',
    name: 'Staff Validador',
    role: UserRole.STAFF,
    pin: '5555',
    isActive: true,
    permissions: {
      allowedOperationTypes: [OperationType.BOLICHE, OperationType.EVENTO],
      allowedGates: ['GATE A', 'ENTRADA PRINCIPAL'],
      allowedModes: ['ENTRY', 'VIP', 'DRINK'],
      canSwitchOperationProfile: false,
      canUseOfflineContingency: false
    }
  },
  {
    id: 'a1',
    name: 'Super Admin',
    role: UserRole.ADMIN,
    pin: '1234',
    isActive: true,
    permissions: {
      allowedOperationTypes: Object.values(OperationType),
      allowedGates: ['ALL'],
      allowedModes: ['ALL'],
      canSwitchOperationProfile: true,
      canUseOfflineContingency: true
    }
  }
];

export const MOCK_EVENTS: EventSession[] = [
  {
    id: 'e1',
    operationType: OperationType.BOLICHE,
    name: 'Fiesta Noche Retro 90s',
    venue: 'Salta Capital',
    dateTimeStart: '2024-06-15T23:30:00Z',
    dateTimeEnd: '2024-06-16T06:00:00Z',
    status: 'ACTIVE'
  },
  {
    id: 'e2',
    operationType: OperationType.CINE,
    name: 'The Batman: Estreno',
    venue: 'Cine Hoyts Salta',
    dateTimeStart: '2024-06-22T20:00:00Z',
    dateTimeEnd: '2024-06-22T23:00:00Z',
    status: 'UPCOMING'
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    eventId: 'e1',
    ownerUserId: 'u1',
    code: 'ENTRY-90S-SALTA',
    type: TicketType.ENTRY,
    status: TicketStatus.VALID,
    metadata: { detail: 'Acceso General' }
  },
  {
    id: 't2',
    eventId: 'e1',
    ownerUserId: 'u1',
    code: 'DRK-FERNET-01',
    type: TicketType.DRINK,
    status: TicketStatus.VALID,
    metadata: { detail: 'FERNET CON COCA' }
  },
  {
    id: 't3',
    eventId: 'e1',
    ownerUserId: 'u1',
    code: 'DRK-FERNET-02',
    type: TicketType.DRINK,
    status: TicketStatus.VALID,
    metadata: { detail: 'FERNET CON COCA' }
  },
  {
    id: 't4',
    eventId: 'e1',
    ownerUserId: 'u1',
    code: 'USED-DRK-BEER',
    type: TicketType.DRINK,
    status: TicketStatus.USED,
    usedAt: '2024-06-15T23:45:00Z',
    usedInMode: 'DRINK',
    metadata: { detail: 'CERVEZA' }
  }
];
