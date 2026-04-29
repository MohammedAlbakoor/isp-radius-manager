export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  branch?: Branch;
}

export interface Branch {
  id: string;
  name: string;
  city?: string;
  address?: string;
  status: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  fullName: string;
  phone?: string;
  secondaryPhone?: string;
  email?: string;
  nationalId?: string;
  address?: string;
  city?: string;
  area?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blacklisted';
  createdAt: string;
  internetAccounts?: InternetAccount[];
  _count?: { internetAccounts: number };
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  downloadSpeed: number;
  uploadSpeed: number;
  speedUnit: 'K' | 'M' | 'G';
  mikrotikRateLimit: string;
  price: number;
  durationDays: number;
  isUnlimited: boolean;
  status: 'active' | 'inactive';
  _count?: { internetAccounts: number };
}

export interface InternetAccount {
  id: string;
  customerId: string;
  username: string;
  serviceType: 'pppoe' | 'hotspot';
  status: 'active' | 'suspended' | 'expired' | 'disabled' | 'pending';
  packageId: string;
  routerId?: string;
  staticIp?: string;
  macAddress?: string;
  allowedSimultaneousSessions: number;
  expiresAt?: string;
  lastLoginAt?: string;
  customer?: Customer;
  package?: Package;
  router?: Router;
  subscriptions?: Subscription[];
}

export interface Subscription {
  id: string;
  internetAccountId: string;
  packageId: string;
  startsAt: string;
  endsAt: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  internetAccount?: InternetAccount;
  package?: Package;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paidAt?: string;
  reference?: string;
  customer?: Customer;
  receivedBy?: { fullName: string };
}

export interface Router {
  id: string;
  name: string;
  branchId?: string;
  nasIp: string;
  apiHost?: string;
  apiPort: number;
  status: 'active' | 'inactive' | 'maintenance' | 'unreachable';
  lastSeenAt?: string;
  location?: string;
  branch?: Branch;
  _count?: { internetAccounts: number };
}

export interface ActiveSession {
  radacctid: string;
  acctsessionid: string;
  username: string;
  nasipaddress: string;
  framedipaddress?: string;
  acctstarttime?: string;
  acctsessiontime?: number;
  acctinputoctets?: string;
  acctoutputoctets?: string;
  acctuniqueid: string;
  customerName?: string;
  packageName?: string;
  routerName?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
  actor?: { username: string; fullName: string };
}

export interface DashboardData {
  customers: { total: number };
  accounts: { active: number; suspended: number; expired: number };
  subscriptions: { active: number; expiringToday: number };
  sessions: { online: number };
  routers: { total: number; active: number };
  revenue: { last30Days: number; transactionCount: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
