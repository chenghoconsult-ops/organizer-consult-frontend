const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const TOKEN_KEY = 'ocb_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { message?: string | string[] }
      if (body.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message
      }
    } catch {
      // non-JSON error body; keep statusText
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me')
}

// --- Cases (Phase 1) ---

export type CaseStatus =
  | 'dataProvided'
  | 'onlineConsultScheduled'
  | 'onlineConsultDone'
  | 'siteSurveyScheduled'
  | 'siteSurveyDone'
  | 'quoteProvided'
  | 'depositReceived'
  | 'serviceDone'
  | 'balanceBillProvided'
  | 'balancePaid'
  | 'invoiceIssued'
  | 'reviewReceived'
  | 'closed'

export interface UserSummary {
  id: string
  name: string
  email: string
  role: string
}

export interface CaseListItem {
  id: string
  caseNumber: string
  status: CaseStatus
  customerName: string
  phone: string | null
  email: string | null
  assignedToId: string | null
  assignedTo: UserSummary | null
  createdAt: string
}

export interface CaseStatusLog {
  id: string
  fromStatus: CaseStatus | null
  toStatus: CaseStatus
  changedBy: UserSummary | null
  note: string | null
  changedAt: string
}

export interface ConsultationRequest {
  id: string
  serviceExperience: string
  housingPlan: string
  serviceArea: string
  serviceDistrict: string
  targetMonth: string
  serviceInterests: string[]
  consultTimeSlots: string[]
  moveInDate: string | null
  name: string
  email: string
  phone: string
  lineId: string | null
  altContact: string | null
  serviceAddress: string
  newHomeAddress: string | null
  interiorArea: string
  housingTypes: string[]
  housingTypeOther: string | null
  customerIdentity: string
  customerIdentityOther: string | null
  referralSource: string
  referralSourceOther: string | null
  additionalNotes: string | null
  source: string
  createdAt: string
}

export interface CaseAssignmentLog {
  id: string
  fromAssignedTo: UserSummary | null
  toAssignedTo: UserSummary | null
  changedBy: UserSummary | null
  changedAt: string
}

export interface CaseDetail extends CaseListItem {
  address: string | null
  lineUserId: string | null
  createdBy: UserSummary | null
  consultationRequest: ConsultationRequest | null
  statusLogs: CaseStatusLog[]
  assignmentLogs: CaseAssignmentLog[]
}

export interface ConsultationInput {
  serviceExperience: string
  housingPlan: string
  serviceArea: string
  serviceDistrict: string
  targetMonth: string
  serviceInterests: string[]
  consultTimeSlots: string[]
  moveInDate?: string
  name: string
  email: string
  phone: string
  lineId?: string
  altContact?: string
  serviceAddress: string
  newHomeAddress?: string
  interiorArea: string
  housingTypes: string[]
  housingTypeOther?: string
  customerIdentity: string
  customerIdentityOther?: string
  referralSource: string
  referralSourceOther?: string
  additionalNotes?: string
}

export function getCases(): Promise<CaseListItem[]> {
  return apiFetch<CaseListItem[]>('/cases')
}

export function getCase(id: string): Promise<CaseDetail> {
  return apiFetch<CaseDetail>(`/cases/${id}`)
}

export function createConsultation(
  data: ConsultationInput,
): Promise<CaseListItem> {
  return apiFetch<CaseListItem>('/consultations', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Public website intake (no auth) — customer self-service booking form.
export function createWebIntake(
  data: ConsultationInput,
): Promise<CaseListItem> {
  return apiFetch<CaseListItem>('/intake/web', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function advanceCaseStatus(
  id: string,
  toStatus: CaseStatus,
  note?: string,
): Promise<CaseListItem> {
  return apiFetch<CaseListItem>(`/cases/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ toStatus, note }),
  })
}

export function assignCase(
  id: string,
  assignedToId: string | null,
): Promise<CaseListItem> {
  return apiFetch<CaseListItem>(`/cases/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedToId }),
  })
}

// --- Users (manager-only consultant management) ---

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { assignedCases: number }
}

export function getUsers(): Promise<ManagedUser[]> {
  return apiFetch<ManagedUser[]>('/users')
}

export function createConsultant(input: {
  email: string
  password: string
  name?: string
}): Promise<ManagedUser> {
  return apiFetch<ManagedUser>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/users/${id}`, { method: 'DELETE' })
}
