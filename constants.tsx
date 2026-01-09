
import { OperationType, UserRole, TicketType, TicketStatus, User, EventSession, Ticket } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Juan Perez',
    email: 'juan@test.com',
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
    name: 'Noche Retro 90s',
    venue: 'Pinar de Rocha',
    dateTimeStart: '2024-05-20T23:30:00Z',
    dateTimeEnd: '2024-05-21T06:00:00Z',
    status: 'ACTIVE'
  },
  {
    id: 'e2',
    operationType: OperationType.CINE,
    name: 'The Batman: Estreno',
    venue: 'Cine Hoyts Abasto - Sala 4',
    dateTimeStart: '2024-05-22T20:00:00Z',
    dateTimeEnd: '2024-05-22T23:00:00Z',
    status: 'UPCOMING'
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    eventId: 'e1',
    ownerUserId: 'u1',
    code: 'ABC-123-XYZ',
    type: TicketType.ENTRY,
    status: TicketStatus.VALID
  },
  {
    id: 't2',
    eventId: 'e1',
    ownerUserId: 'u1',
    code: 'DRK-999-LMN',
    type: TicketType.DRINK,
    status: TicketStatus.VALID
  },
  {
    id: 't3',
    eventId: 'e1',
    ownerUserId: 'u1',
    code: 'USED-555-QWE',
    type: TicketType.ENTRY,
    status: TicketStatus.USED,
    usedAt: '2024-05-20T23:45:00Z',
    usedInMode: 'ENTRY'
  }
];
