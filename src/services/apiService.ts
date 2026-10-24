import {
  FarmerProfile,
  LandRecord,
  CropCalendarTask,
  ExpenseRecord,
  SubscriptionPlan,
  SubscriptionRecord,
  PaymentTransaction,
  GatewayConfig,
  SubscriptionEntitlements
} from '../types';

const API_BASE = '/api';

/**
 * Check backend connection status and workbook details
 */
export async function getApiStatus(): Promise<{
  connected: boolean;
  workbookPath?: string;
  sizeBytes?: number;
  lastModified?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      connected: true,
      workbookPath: data.workbook?.path,
      sizeBytes: data.workbook?.sizeBytes,
      lastModified: data.workbook?.lastModified
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message
    };
  }
}

/**
 * Fetch all persisted records from the Excel storage
 */
export async function fetchPersistedData(): Promise<{
  success: boolean;
  profile?: FarmerProfile;
  lands?: LandRecord[];
  tasks?: CropCalendarTask[];
  expenses?: ExpenseRecord[];
  settings?: Record<string, string>;
  activityLogs?: any[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/data`);
    if (!res.ok) throw new Error(`Failed to load data from server: HTTP ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      profile: data.profile,
      lands: data.lands,
      tasks: data.tasks,
      expenses: data.expenses,
      settings: data.settings,
      activityLogs: data.activityLogs
    };
  } catch (err: any) {
    console.warn('[FasalSetu API] Unable to connect to local Excel server, using local fallback:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Persist farmer profile updates to Excel
 */
export async function apiSaveProfile(profile: Partial<FarmerProfile>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('[FasalSetu API] Error persisting profile:', err);
    return false;
  }
}

/**
 * Persist application settings (e.g. language, district)
 */
export async function apiSaveSetting(key: string, value: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    return res.ok;
  } catch (err) {
    console.error('[FasalSetu API] Error persisting setting:', err);
    return false;
  }
}

/**
 * Persist Land creation or update
 */
export async function apiSaveLand(land: Partial<LandRecord>): Promise<{ success: boolean; id?: string }> {
  try {
    const res = await fetch(`${API_BASE}/lands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(land)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, id: data.id };
  } catch (err) {
    console.error('[FasalSetu API] Error saving land:', err);
    return { success: false };
  }
}

/**
 * Update existing Land record
 */
export async function apiUpdateLand(id: string, updates: Partial<LandRecord>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/lands/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.ok;
  } catch (err) {
    console.error('[FasalSetu API] Error updating land:', err);
    return false;
  }
}

/**
 * Delete a Land record from Excel
 */
export async function apiDeleteLand(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/lands/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('[FasalSetu API] Error deleting land:', err);
    return false;
  }
}

/**
 * Persist Task creation or update
 */
export async function apiSaveTask(task: Partial<CropCalendarTask>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.ok;
  } catch (err) {
    console.error('[FasalSetu API] Error saving task:', err);
    return false;
  }
}

/**
 * Toggle task completion status
 */
export async function apiToggleTask(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${encodeURIComponent(id)}/toggle`, {
      method: 'PUT'
    });
    return res.ok;
  } catch (err) {
    console.error('[FasalSetu API] Error toggling task:', err);
    return false;
  }
}

/**
 * Delete a Task from Excel
 */
export async function apiDeleteTask(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('[FasalSetu API] Error deleting task:', err);
    return false;
  }
}

/**
 * Persist Expense creation
 */
export async function apiSaveExpense(expense: Partial<ExpenseRecord>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    return res.ok;
  } catch (err) {
    console.error('[FasalSetu API] Error saving expense:', err);
    return false;
  }
}

/**
 * Delete an Expense from Excel
 */
export async function apiDeleteExpense(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/expenses/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('[FasalSetu API] Error deleting expense:', err);
    return false;
  }
}

/**
 * Download the active Excel workbook
 */
export function downloadWorkbookFile(): void {
  const link = document.createElement('a');
  link.href = `${API_BASE}/export/excel`;
  link.setAttribute('download', 'FasalSetu_Data.xlsx');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Send natural language question to AI Kisan Mitra with conversation context
 */
export async function apiSendChatMessage(params: {
  message: string;
  conversationHistory?: Array<{ sender: 'user' | 'ai'; text: string }>;
  farmerName?: string;
  location?: string;
  imageUrl?: string;
}): Promise<{
  success: boolean;
  replyText?: string;
  provider?: string;
  suggestions?: string[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Server returned error ${res.status}`);
    }

    return {
      success: true,
      replyText: data.replyText,
      provider: data.provider,
      suggestions: data.suggestions
    };
  } catch (err: any) {
    console.error('[ApiService] Chat request failed:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

// ==========================================
// SUBSCRIPTION & PAYMENT WORKFLOW APIS
// ==========================================

/**
 * Fetch available subscription plans
 */
export async function fetchSubscriptionPlans(): Promise<{
  success: boolean;
  plans: SubscriptionPlan[];
  gateway?: { provider: string; configured: boolean; keyId: string | null; currency: string };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/subscription/plans`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      plans: data.plans || [],
      gateway: data.gateway
    };
  } catch (err: any) {
    console.warn('[ApiService] Failed to fetch subscription plans:', err.message);
    return {
      success: false,
      plans: [],
      error: err.message
    };
  }
}

/**
 * Fetch gateway configuration status
 */
export async function fetchGatewayConfig(): Promise<GatewayConfig> {
  try {
    const res = await fetch(`${API_BASE}/subscription/gateway-config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      configured: false,
      keyId: null,
      currency: 'INR',
      requiredEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']
    };
  }
}

/**
 * Fetch current active subscription for a farmer (optionally for a specific season)
 */
export async function fetchCurrentSubscription(
  userId?: string,
  season?: string,
  agriYear?: string
): Promise<{
  success: boolean;
  subscription: SubscriptionRecord | null;
  isPremium: boolean;
  isBasic: boolean;
  hasActiveSubscription: boolean;
  entitlements?: SubscriptionEntitlements;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (season) params.append('season', season);
    if (agriYear) params.append('agriYear', agriYear);

    const qs = params.toString();
    const url = qs ? `${API_BASE}/subscription/current?${qs}` : `${API_BASE}/subscription/current`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      subscription: data.subscription || null,
      isPremium: Boolean(data.isPremium),
      isBasic: Boolean(data.isBasic),
      hasActiveSubscription: Boolean(data.hasActiveSubscription),
      entitlements: data.entitlements
    };
  } catch (err: any) {
    console.warn('[ApiService] Error fetching current subscription:', err.message);
    return {
      success: false,
      subscription: null,
      isPremium: false,
      isBasic: false,
      hasActiveSubscription: false,
      error: err.message
    };
  }
}

/**
 * Fetch transaction history for a farmer
 */
export async function fetchPaymentTransactions(userId?: string): Promise<{
  success: boolean;
  transactions: PaymentTransaction[];
  error?: string;
}> {
  try {
    const url = userId
      ? `${API_BASE}/subscription/transactions?userId=${encodeURIComponent(userId)}`
      : `${API_BASE}/subscription/transactions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      transactions: data.transactions || []
    };
  } catch (err: any) {
    console.warn('[ApiService] Error fetching transactions:', err.message);
    return {
      success: false,
      transactions: [],
      error: err.message
    };
  }
}

/**
 * Create a backend payment order via Razorpay for a specific farming season
 */
export async function createSubscriptionOrder(
  planId: string,
  userDetails: {
    userId: string;
    farmerName?: string;
    email?: string;
    mobile?: string;
    season?: string;
    agriYear?: string;
    cropCycle?: string;
    state?: string;
  }
): Promise<{
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  planId?: string;
  planName?: string;
  season?: string;
  agriYear?: string;
  startDate?: string;
  expiryDate?: string;
  daysRemaining?: number;
  isUpgrade?: boolean;
  amountINR?: number;
  code?: string;
  message?: string;
  instructions?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/subscription/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        ...userDetails
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        code: data.code,
        message: data.message || data.error,
        instructions: data.instructions,
        error: data.error || data.message || `Order creation failed (HTTP ${res.status})`
      };
    }

    return {
      success: true,
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency,
      keyId: data.keyId,
      planId: data.planId,
      planName: data.planName,
      season: data.season,
      agriYear: data.agriYear,
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      daysRemaining: data.daysRemaining,
      isUpgrade: data.isUpgrade,
      amountINR: data.amountINR
    };
  } catch (err: any) {
    console.error('[ApiService] Create subscription order exception:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Verify payment signature and activate season subscription
 */
export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId: string;
  userId: string;
  season?: string;
  agriYear?: string;
  cropCycle?: string;
  state?: string;
}): Promise<{
  success: boolean;
  message?: string;
  subscription?: SubscriptionRecord;
  alreadyProcessed?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/subscription/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Payment verification failed (HTTP ${res.status})`
      };
    }

    return {
      success: true,
      message: data.message,
      subscription: data.subscription,
      alreadyProcessed: data.alreadyProcessed
    };
  } catch (err: any) {
    console.error('[ApiService] Verify payment error:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Request an expert consultation (Premium feature entitlement)
 */
export async function requestExpertConsultation(payload: {
  userId: string;
  cropName: string;
  queryTopic: string;
  contactNumber?: string;
  preferredTime?: string;
}): Promise<{
  success: boolean;
  requestId?: string;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/subscription/expert-consultation-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Consultation request failed (HTTP ${res.status})`
      };
    }

    return {
      success: true,
      requestId: data.requestId,
      message: data.message
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message
    };
  }
}
