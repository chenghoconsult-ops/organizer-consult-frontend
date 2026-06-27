import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createWebIntake, type ConsultationInput } from '../lib/api'
import { ConsultationForm } from '../components/ConsultationForm'

export function PublicConsultationPage() {
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: (data: ConsultationInput) => createWebIntake(data),
    onError: (e) => setError((e as Error).message),
  })

  return (
    <div className="min-h-full bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {create.isSuccess ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-semibold text-slate-900">預約已送出 🎉</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              感謝您的預約，我們已收到您的諮詢資料，將盡快與您聯繫。
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-900">預約諮詢登記</h1>
            <p className="mt-1 text-sm text-slate-500">
              請填寫以下資料，送出後我們會盡快與您聯繫安排線上諮詢。標示
              <span className="mx-0.5 text-red-500">*</span>為必填。
            </p>

            <ConsultationForm
              onSubmit={(payload) => {
                setError(null)
                create.mutate(payload)
              }}
              submitting={create.isPending}
              error={error}
              submitLabel="送出預約"
              submittingLabel="送出中…"
            />
          </>
        )}
      </main>
    </div>
  )
}
