import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createConsultation, type ConsultationInput } from '../lib/api'
import { ConsultationForm } from '../components/ConsultationForm'
import { PageShell } from '../components/PageShell'

export function ConsultationFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: (data: ConsultationInput) => createConsultation(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases'] })
      navigate('/cases', { replace: true })
    },
    onError: (e) => setError((e as Error).message),
  })

  return (
    <PageShell>
      <h1 className="text-lg font-semibold text-slate-900">代填預約諮詢</h1>
      <p className="mt-1 text-sm text-slate-500">
        送出後會自動建立案件（狀態 1 已提供資料）並回到列表。
      </p>

      <ConsultationForm
        onSubmit={(payload) => {
          setError(null)
          create.mutate(payload)
        }}
        submitting={create.isPending}
        error={error}
        submitLabel="建立案件"
        submittingLabel="建立中…"
        onCancel={() => navigate('/cases')}
      />
    </PageShell>
  )
}
