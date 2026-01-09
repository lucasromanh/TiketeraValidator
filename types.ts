
export enum OperationType {
  BOLICHE = 'BOLICHE',
  EVENTO = 'EVENTO',
  EVENTO_GRANDE = 'EVENTO_GRANDE',
  CINE = 'CINE'
}

export enum UserRole {
  ASSISTANT = 'ASSISTANT',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

export enum TicketType {
  ENTRY = 'ENTRY',
  VIP = 'VIP',
  DRINK = 'DRINK',
  SEAT = 'SEAT',
  POPCORN = 'POPCORN',
  OTHER = 'OTHER'
}

export enum TicketStatus {
  VALID = 'VALID',
  USED = 'USED',
  BLOCKED = 'BLOCKED'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  pin?: string;
  isActive: boolean;
  permissions?: {
    allowedOperationTypes: OperationType[];
    allowedGates: string[];
    allowedModes: string[];
    canSwitchOperationProfile: boolean;
    canUseOfflineContingency: boolean;
  };
}

export interface EventSession {
  id: string;
  operationType: OperationType;
  name: string;
  venue: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  status: 'ACTIVE' | 'FINISHED' | 'UPCOMING';
}

export interface Ticket {
  id: string;
  eventId: string;
  ownerUserId: string;
  code: string;
  type: TicketType;
  status: TicketStatus;
  usedAt?: string;
  usedByDeviceId?: string;
  usedInMode?: string;
  metadata?: Record<string, any>;
}

export interface ScanAttempt {
  id: string;
  timestamp: string;
  deviceId: string;
  staffUserId: string;
  codeHash: string;
  result: 'APPROVED' | 'REJECTED';
  reason?: string;
  operationType: OperationType;
  mode: string;
  gate: string;
  eventId: string;
}
