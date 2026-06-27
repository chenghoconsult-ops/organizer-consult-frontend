import { useQuery } from '@tanstack/react-query'
import { getCases } from '../lib/api'
import { useAuth } from '../lib/auth'

export function CasesPage() {
  const { user, logout } = useAuth()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cases'],
    queryFn: getCases,
  })

  const cases = data ?? []

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="font-semibold text-slate-900">整理師業務後台</span>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user?.name}（{user?.role}）
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-lg font-semibold text-slate-900">案件列表</h1>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-slate-400">載入中…</div>
          ) : isError ? (
            <div className="px-6 py-16 text-center text-red-600">
              無法載入案件列表
            </div>
          ) : cases.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-slate-900">目前沒有案件</p>
              <p className="mt-1 text-sm text-slate-500">
                案件建立功能將於 Phase 1 推出。
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {cases.map((_, i) => (
                <li key={i} className="px-6 py-4 text-slate-700">
                  案件 #{i + 1}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
