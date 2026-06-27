import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { assignCase, getCases, type CaseListItem } from '../lib/api'
import { useAuth } from '../lib/auth'
import { PageShell } from '../components/PageShell'
import { StatusBadge } from '../components/StatusBadge'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export function CasesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cases'],
    queryFn: getCases,
  })

  const claim = useMutation({
    mutationFn: (id: string) => assignCase(id, user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })

  const filtered = useMemo(() => {
    const cases = data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return cases
    return cases.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.caseNumber.includes(q) ||
        (c.phone ?? '').includes(q),
    )
  }, [data, search])

  const totalCount = data?.length ?? 0

  // 分組：指派給我 → 未指派 → 指派給他人
  const groups = useMemo(() => {
    const mine: CaseListItem[] = []
    const unassigned: CaseListItem[] = []
    const others: CaseListItem[] = []
    for (const c of filtered) {
      if (c.assignedToId === user?.id) mine.push(c)
      else if (c.assignedToId === null) unassigned.push(c)
      else others.push(c)
    }
    return { mine, unassigned, others }
  }, [filtered, user?.id])

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-slate-900">
          案件列表
          <span className="ml-2 text-sm font-normal text-slate-500">
            共 {totalCount} 件
          </span>
        </h1>
        <Link
          to="/consultation/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          ＋ 新增諮詢
        </Link>
      </div>

      <input
        type="search"
        placeholder="搜尋姓名 / 案件號 / 電話"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 sm:max-w-xs"
      />

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-400">
          載入中…
        </div>
      ) : isError ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-red-600">
          無法載入案件列表
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          <CaseGroup
            title="指派給我"
            cases={groups.mine}
            onNavigate={(id) => navigate(`/cases/${id}`)}
            onClaim={(id) => claim.mutate(id)}
            claiming={claim.isPending ? claim.variables : undefined}
          />
          <CaseGroup
            title="未指派"
            cases={groups.unassigned}
            onNavigate={(id) => navigate(`/cases/${id}`)}
            onClaim={(id) => claim.mutate(id)}
            claiming={claim.isPending ? claim.variables : undefined}
          />
          <CaseGroup
            title="指派給其他顧問"
            cases={groups.others}
            onNavigate={(id) => navigate(`/cases/${id}`)}
            onClaim={(id) => claim.mutate(id)}
            claiming={claim.isPending ? claim.variables : undefined}
          />
        </div>
      )}
    </PageShell>
  )
}

function CaseGroup({
  title,
  cases,
  onNavigate,
  onClaim,
  claiming,
}: {
  title: string
  cases: CaseListItem[]
  onNavigate: (id: string) => void
  onClaim: (id: string) => void
  claiming?: string
}) {
  if (cases.length === 0) return null

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-slate-500">
        {title}（{cases.length}）
      </h2>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {cases.map((c) => (
            <li
              key={c.id}
              onClick={() => onNavigate(c.id)}
              className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 transition hover:bg-slate-50 sm:px-6"
            >
              <span className="font-mono text-sm text-slate-500">
                {c.caseNumber}
              </span>
              <span className="font-medium text-slate-900">
                {c.customerName}
              </span>
              <StatusBadge status={c.status} />
              <span className="ml-auto flex items-center gap-3">
                <span className="hidden text-sm text-slate-400 sm:inline">
                  {c.assignedTo ? c.assignedTo.name : '未指派'} ·{' '}
                  {formatDate(c.createdAt)}
                </span>
                {c.assignedToId === null && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onClaim(c.id)
                    }}
                    disabled={claiming === c.id}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    {claiming === c.id ? '認領中…' : '認領'}
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
