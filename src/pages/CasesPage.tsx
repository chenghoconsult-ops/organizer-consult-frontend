import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  assignCase,
  getCases,
  getUsers,
  type CaseListItem,
  type ManagedUser,
} from '../lib/api'
import { useAuth } from '../lib/auth'
import { PageShell } from '../components/PageShell'
import { StatusBadge } from '../components/StatusBadge'
import { STATUS_ORDER } from '../lib/labels'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

type ViewMode = 'date' | 'state' | 'consultant'

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'date', label: '依日期排序' },
  { value: 'state', label: '依狀態排序' },
  { value: 'consultant', label: '依顧問分組' },
]

const VIEW_KEY = 'ocb_cases_view'

interface Section {
  key: string
  title: string | null
  cases: CaseListItem[]
}

export function CasesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem(VIEW_KEY) as ViewMode) || 'date',
  )
  const isManager = user?.role === 'manager'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cases'],
    queryFn: getCases,
  })

  // Consultant list for the manager's per-row assignment picker.
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isManager,
  })

  const assign = useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string | null }) =>
      assignCase(id, assignedToId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })

  function setViewMode(v: ViewMode) {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

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

  const sections = useMemo<Section[]>(() => {
    const byDateDesc = (a: CaseListItem, b: CaseListItem) =>
      b.createdAt.localeCompare(a.createdAt)

    if (view === 'date') {
      return [
        { key: 'all', title: null, cases: [...filtered].sort(byDateDesc) },
      ]
    }

    if (view === 'state') {
      const sorted = [...filtered].sort((a, b) => {
        const d = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
        return d !== 0 ? d : byDateDesc(a, b)
      })
      return [{ key: 'all', title: null, cases: sorted }]
    }

    // group by consultant: 未指派 first, then each assignee by name
    const unassigned: CaseListItem[] = []
    const byConsultant = new Map<string, { name: string; cases: CaseListItem[] }>()
    for (const c of filtered) {
      if (!c.assignedTo) {
        unassigned.push(c)
      } else {
        const g = byConsultant.get(c.assignedTo.id) ?? {
          name: c.assignedTo.name,
          cases: [],
        }
        g.cases.push(c)
        byConsultant.set(c.assignedTo.id, g)
      }
    }
    const out: Section[] = []
    if (unassigned.length) {
      out.push({
        key: 'unassigned',
        title: '未指派',
        cases: unassigned.sort(byDateDesc),
      })
    }
    for (const [id, g] of [...byConsultant.entries()].sort((a, b) =>
      a[1].name.localeCompare(b[1].name),
    )) {
      out.push({ key: id, title: g.name, cases: g.cases.sort(byDateDesc) })
    }
    return out
  }, [filtered, view])

  const totalCount = data?.length ?? 0

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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="搜尋姓名 / 案件號 / 電話"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 sm:max-w-xs"
        />
        {/* 檢視方式 */}
        <div className="inline-flex rounded-lg border border-slate-300 p-0.5">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setViewMode(opt.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === opt.value
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-400">
          載入中…
        </div>
      ) : isError ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-red-600">
          無法載入案件列表
        </div>
      ) : sections.every((s) => s.cases.length === 0) ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
          沒有符合的案件
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {sections.map((s) => (
            <CaseSection
              key={s.key}
              title={s.title}
              cases={s.cases}
              isManager={isManager}
              users={users ?? []}
              onNavigate={(id) => navigate(`/cases/${id}`)}
              onAssign={(id, assignedToId) => assign.mutate({ id, assignedToId })}
              assigningId={assign.isPending ? assign.variables.id : undefined}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}

function CaseSection({
  title,
  cases,
  isManager,
  users,
  onNavigate,
  onAssign,
  assigningId,
}: {
  title: string | null
  cases: CaseListItem[]
  isManager: boolean
  users: ManagedUser[]
  onNavigate: (id: string) => void
  onAssign: (id: string, assignedToId: string | null) => void
  assigningId?: string
}) {
  if (cases.length === 0) return null

  return (
    <section>
      {title && (
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          {title}（{cases.length}）
        </h2>
      )}
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
              <span className="font-mono text-sm text-slate-500">
                {c.phone ?? '—'}
              </span>
              <StatusBadge status={c.status} />
              <span className="ml-auto flex items-center gap-3">
                <span className="hidden text-sm text-slate-400 sm:inline">
                  {formatDate(c.createdAt)}
                </span>
                {isManager ? (
                  <select
                    value={c.assignedToId ?? ''}
                    disabled={assigningId === c.id}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation()
                      onAssign(c.id, e.target.value || null)
                    }}
                    className="max-w-[10rem] rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 disabled:opacity-50"
                  >
                    <option value="">未指派</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-slate-400">
                    {c.assignedTo ? c.assignedTo.name : '未指派'}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
