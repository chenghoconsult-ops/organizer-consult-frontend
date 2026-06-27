import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function PageShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/cases" className="font-semibold text-slate-900">
            整理師業務後台
          </Link>
          <div className="flex items-center gap-3">
            {user?.role === 'manager' && (
              <Link
                to="/consultants"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                顧問管理
              </Link>
            )}
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
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
