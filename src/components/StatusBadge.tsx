import type { CaseStatus } from '../lib/api'
import { STATUS_LABELS, statusStep } from '../lib/labels'

// 依狀態分段給色：前期(藍) → 場勘/報價(琥珀) → 收款/服務(綠) → 結案(灰)。
const STATUS_COLORS: Record<CaseStatus, string> = {
  dataProvided: 'bg-sky-100 text-sky-800',
  onlineConsultScheduled: 'bg-sky-100 text-sky-800',
  onlineConsultDone: 'bg-indigo-100 text-indigo-800',
  siteSurveyScheduled: 'bg-amber-100 text-amber-800',
  siteSurveyDone: 'bg-amber-100 text-amber-800',
  quoteProvided: 'bg-amber-100 text-amber-800',
  depositReceived: 'bg-emerald-100 text-emerald-800',
  serviceDone: 'bg-emerald-100 text-emerald-800',
  balanceBillProvided: 'bg-emerald-100 text-emerald-800',
  balancePaid: 'bg-emerald-100 text-emerald-800',
  invoiceIssued: 'bg-emerald-100 text-emerald-800',
  reviewReceived: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-200 text-slate-600',
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {statusStep(status)}. {STATUS_LABELS[status]}
    </span>
  )
}
