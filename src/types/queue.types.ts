/**
 * QueueLess — TypeScript Type Definitions
 * Enterprise Virtual Queue & Appointment Dispatch System
 */

export type SectorType = 'UNIVERSITY' | 'PVT_LTD' | 'PSU' | 'TECH_CORP' | 'HEALTH' | 'GENERAL';

export type UserRole = 'ADMIN' | 'STAFF' | 'VISITOR';

export type TokenType = 'APPOINTMENT' | 'WALK_IN' | 'PRIORITY';

export type TokenStatus =
  | 'PENDING_APPROVAL'
  | 'QUEUED'
  | 'CALLED'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED_BY_ORG';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  orgSector?: SectorType;
  orgName?: string;
  phone: string;
  userLocation?: string;
  personalAddress?: string;
  staffId?: string;
  designation?: string;
  department?: string;
  counterId?: number;
  counterName?: string;
  leaveStatus?: 'ON_DUTY' | 'ON_LEAVE';
}

/**
 * Staff Self Profile: Full sensitive personal data
 */
export interface StaffSelfProfile {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  personalAddress: string;
  designation: string;
  department: string;
  counterId: number;
  counterName: string;
  leaveStatus: 'ON_DUTY' | 'ON_LEAVE';
  dateOfJoining: string;
}

/**
 * Peer Staff Profile: Strict privacy masking for colleagues
 */
export interface StaffColleagueSummary {
  id: string;
  name: string;
  designation: string;
  department: string;
  counterName: string;
  leaveStatus: 'ON_DUTY' | 'ON_LEAVE';
  // Contact phone and address are strictly omitted/masked!
}

export interface OrganizationListing {
  id: string;
  name: string;
  category: 'TECH' | 'HEALTH' | 'EDU' | 'GOVT';
  categoryName: string;
  placeRating: number;
  ratingCount: number;
  distanceKm: number;
  budgetLevel: 'FREE' | 'AFFORDABLE' | 'PREMIUM';
  feeAmount: number;
  feeLabel: string;
  address: string;
  emergencySupported: boolean;
  icon: string;
  services: ServiceDepartment[];
}

export interface ServiceDepartment {
  id: number;
  name: string;
  code: string;
  avgDuration: number;
  isPriorityAllowed: boolean;
  icon: string;
}

export interface StaffCounter {
  id: number;
  name: string;
  staff: string;
  serviceId: number;
  currentToken: string | null;
  status: 'IDLE' | 'CALLING' | 'IN_SERVICE';
  isActive: boolean;
}

export interface QueueToken {
  id: number;
  tokenNumber: string;
  userName: string;
  userPhone: string;
  userLocation?: string;
  serviceId: number;
  serviceName: string;
  perspective?: string;
  counterId: number | null;
  tokenType: TokenType;
  status: TokenStatus;
  slotTime: string | null;
  checkInTime: string | null;
  calledAt: string | null;
  completedAt: string | null;
  denialReason?: string | null;
  isEmergency?: boolean;
  missedCount: number;
  createdAt: string;
  qrPayload?: string;
}

/**
 * Transit Time Matrix based on handwritten notes (1 km base)
 */
export interface DetailedTransitMatrix {
  distanceKm: string;
  walk: { min: number; max: number; label: string; icon: string };
  cycle: { min: number; max: number; label: string; icon: string };
  eBike: { min: number; max: number; label: string; icon: string };
  twoWheeler: { min: number; max: number; label: string; icon: string };
  fourWheeler: { min: number; max: number; label: string; icon: string };
}

export interface OrganizationSearchParams {
  category: 'ALL' | 'TECH' | 'HEALTH' | 'EDU' | 'GOVT';
  placePriority: 'HIGH_TO_LOW' | 'LOW_TO_HIGH';
  locationPriority: 'NEAREST_FIRST' | 'FAR_FIRST';
  budgetPriority: 'LOW_TO_HIGH' | 'HIGH_TO_LOW';
  isEmergency: boolean;
  searchQuery?: string;
}
