import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  advanceCaseStatus,
  assignCase,
  getCase,
  type CaseStatus,
  type ConsultationRequest,
} from '../lib/api'
import { useAuth } from '../lib/auth'
import { PageShell } from '../components/PageShell'
import { StatusBadge } from '../components/StatusBadge'
import {
  BUDGET_RANGE,
  CONSULT_TIME_SLOT,
  CUSTOMER_IDENTITY,
  HOUSING_PLAN,
  HOUSING_TYPE,
  REFERRAL_SOURCE,
  SERVICE_AREA,
  SERVICE_EXPERIENCE,
  SERVICE_INTEREST,
  STATUS_LABELS,
  TARGET_MONTH,
  nextStatus,
} from '../lib/labels'

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')

  const { data: c, isLoading, isError } = useQuery({
    queryKey: ['case', id],
    queryFn: () => getCase(id!),
    enabled: !!id,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['case', id] })
    void queryClient.invalidateQueries({ queryKey: ['cases'] })
  }

  const advance = useMutation({
    mutationFn: (toStatus: CaseStatus) =>
      advanceCaseStatus(id!, toStatus, note || undefined),
    onSuccess: () => {
      setNote('')
      invalidate()
    },
  })

  const reassign = useMutation({
    mutationFn: (assignedToId: string | null) => assignCase(id!, assignedToId),
    onSuccess: invalidate,
  })

  if (isLoading)
    return (
      <PageShell>
        <p className="text-slate-400">載入中…</p>
      </PageShell>
    )
  if (isError || !c)
    return (
      <PageShell>
        <p className="text-red-600">無法載入案件</p>
        <Link to="/cases" className="text-sm text-slate-500 underline">
          ← 回列表
        </Link>
      </PageShell>
    )

  const isManager = user?.role === 'manager'
  const isAssignee = c.assignedToId === user?.id
  const canAdvance = isManager || isAssignee
  const next = nextStatus(c.status)

  return (
    <PageShell>
      <Link to="/cases" className="text-sm text-slate-500 hover:underline">
        ← 回列表
      </Link>

      {/* 標頭 */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-slate-500">{c.caseNumber}</span>
        <h1 className="text-xl font-semibold text-slate-900">
          {c.customerName}
        </h1>
        <StatusBadge status={c.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* 左：客戶 + 諮詢內容 */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="客戶摘要">
            <Field label="電話" value={c.phone} />
            <Field label="Email" value={c.email} />
            <Field label="地址" value={c.address} />
            <Field
              label="指派對象"
              value={c.assignedTo ? c.assignedTo.name : '未指派'}
            />
            <Field
              label="建立者"
              value={c.createdBy ? c.createdBy.name : '系統 / 匯入'}
            />
            <Field label="建立時間" value={formatDateTime(c.createdAt)} />
          </Card>

          {c.consultationRequest ? (
            <ConsultationCard cr={c.consultationRequest} />
          ) : (
            <Card title="諮詢內容">
              <p className="text-sm text-slate-500">
                此案件由歷史預約單匯入，無完整諮詢表單資料。
              </p>
            </Card>
          )}
        </div>

        {/* 右：操作 + 時間軸 */}
        <div className="space-y-6">
          <Card title="狀態操作">
            {next ? (
              <>
                <p className="text-sm text-slate-600">
                  下一步：
                  <span className="font-medium text-slate-900">
                    {STATUS_LABELS[next]}
                  </span>
                </p>
                <textarea
                  placeholder="備註（選填）"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!canAdvance}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50"
                />
                <button
                  onClick={() => advance.mutate(next)}
                  disabled={!canAdvance || advance.isPending}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {advance.isPending
                    ? '處理中…'
                    : `推進至「${STATUS_LABELS[next]}」`}
                </button>
                {!canAdvance && (
                  <p className="text-xs text-amber-600">
                    僅案件的指派顧問或經理可推進狀態。
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">已是最終狀態（已結案）。</p>
            )}

            {advance.isError && (
              <p className="text-xs text-red-600">
                {(advance.error as Error).message}
              </p>
            )}

            {/* 指派操作 */}
            <div className="border-t border-slate-100 pt-3">
              {c.assignedToId === null ? (
                <button
                  onClick={() => reassign.mutate(user!.id)}
                  disabled={reassign.isPending}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  認領給自己
                </button>
              ) : isManager ? (
                <div className="space-y-2">
                  {!isAssignee && (
                    <button
                      onClick={() => reassign.mutate(user!.id)}
                      disabled={reassign.isPending}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      改派給自己
                    </button>
                  )}
                  <button
                    onClick={() => reassign.mutate(null)}
                    disabled={reassign.isPending}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    解除指派
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  已指派給 {c.assignedTo?.name}。
                </p>
              )}
              {reassign.isError && (
                <p className="mt-1 text-xs text-red-600">
                  {(reassign.error as Error).message}
                </p>
              )}
            </div>
          </Card>

          <Card title="狀態時間軸">
            <ol className="space-y-3">
              {c.statusLogs.map((log) => (
                <li key={log.id} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {log.fromStatus
                        ? `${STATUS_LABELS[log.fromStatus]} → ${STATUS_LABELS[log.toStatus]}`
                        : STATUS_LABELS[log.toStatus]}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(log.changedAt)}
                      {log.changedBy ? ` · ${log.changedBy.name}` : ''}
                    </p>
                    {log.note && (
                      <p className="mt-0.5 text-xs text-slate-500">{log.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-20 shrink-0 text-slate-400">{label}</span>
      <span className="text-slate-800">{value || '—'}</span>
    </div>
  )
}

function mapList(values: string[], map: Record<string, string>): string {
  return values.map((v) => map[v] ?? v).join('、') || '—'
}

function ConsultationCard({ cr }: { cr: ConsultationRequest }) {
  return (
    <Card title="諮詢內容">
      <Field
        label="使用經驗"
        value={SERVICE_EXPERIENCE[cr.serviceExperience]}
      />
      <Field label="換屋計畫" value={HOUSING_PLAN[cr.housingPlan]} />
      <Field label="服務區域" value={SERVICE_AREA[cr.serviceArea]} />
      <Field
        label="希望月份"
        value={cr.targetMonthOther || TARGET_MONTH[cr.targetMonth]}
      />
      <Field
        label="想了解服務"
        value={mapList(cr.serviceInterests, SERVICE_INTEREST)}
      />
      <Field
        label="諮詢時段"
        value={mapList(cr.consultTimeSlots, CONSULT_TIME_SLOT)}
      />
      <Field label="預算" value={BUDGET_RANGE[cr.budgetRange]} />
      <Field
        label="房屋類型"
        value={
          mapList(cr.housingTypes, HOUSING_TYPE) +
          (cr.housingTypeOther ? `、${cr.housingTypeOther}` : '')
        }
      />
      <Field
        label="身份"
        value={cr.customerIdentityOther || CUSTOMER_IDENTITY[cr.customerIdentity]}
      />
      <Field
        label="認識管道"
        value={cr.referralSourceOther || REFERRAL_SOURCE[cr.referralSource]}
      />
      <Field label="服務地址" value={cr.serviceAddress} />
      <Field label="新家地址" value={cr.newHomeAddress} />
      <Field label="LINE ID" value={cr.lineId} />
      <Field label="搬入日期" value={cr.moveInDate} />
      <Field label="備註" value={cr.additionalNotes} />
    </Card>
  )
}
