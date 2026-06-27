import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import {
  createConsultant,
  deleteUser,
  getUsers,
  type ManagedUser,
} from '../lib/api'
import { useAuth } from '../lib/auth'
import { PageShell } from '../components/PageShell'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export function ConsultantsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: user?.role === 'manager',
  })

  const create = useMutation({
    mutationFn: () =>
      createConsultant({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      }),
    onSuccess: () => {
      setEmail('')
      setPassword('')
      setName('')
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e) => setError((e as Error).message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      // 案件指派可能因刪除顧問而改變，一併刷新。
      void queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })

  // 僅經理可進入。
  if (user && user.role !== 'manager') {
    return <Navigate to="/cases" replace />
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    create.mutate()
  }

  const users = data ?? []
  const consultants = users.filter((u) => u.role === 'consultant')

  return (
    <PageShell>
      <h1 className="text-lg font-semibold text-slate-900">顧問管理</h1>
      <p className="mt-1 text-sm text-slate-500">
        新增顧問帳號（輸入 Email 與密碼），或移除既有顧問。
      </p>

      {/* 新增顧問 */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-sm font-semibold text-slate-900">新增顧問</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700">
              Email<span className="ml-0.5 text-red-500">*</span>
            </span>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700">
              密碼<span className="ml-0.5 text-red-500">*</span>
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
            <span className="mt-1 block text-xs text-slate-400">至少 8 碼</span>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700">
              姓名（選填）
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="未填則取 Email 前段"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={create.isPending}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {create.isPending ? '新增中…' : '新增顧問'}
        </button>
      </form>

      {/* 顧問列表 */}
      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          顧問（{consultants.length}）
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-slate-400">載入中…</div>
          ) : isError ? (
            <div className="px-6 py-12 text-center text-red-600">
              無法載入顧問列表
            </div>
          ) : consultants.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              目前沒有顧問，請於上方新增。
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {consultants.map((u) => (
                <ConsultantRow
                  key={u.id}
                  user={u}
                  onDelete={() => remove.mutate(u.id)}
                  deleting={remove.isPending && remove.variables === u.id}
                />
              ))}
            </ul>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          註：刪除顧問後，原本指派給他的案件會自動變回「未指派」。經理帳號無法被刪除。
        </p>
      </div>
    </PageShell>
  )
}

function ConsultantRow({
  user,
  onDelete,
  deleting,
}: {
  user: ManagedUser
  onDelete: () => void
  deleting: boolean
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
      <span className="font-medium text-slate-900">{user.name}</span>
      <span className="text-sm text-slate-500">{user.email}</span>
      <span className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-slate-400 sm:inline">
          指派 {user._count.assignedCases} 件 · {formatDate(user.createdAt)}
        </span>
        {confirming ? (
          <>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? '刪除中…' : '確認刪除'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              取消
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            刪除
          </button>
        )}
      </span>
    </li>
  )
}
