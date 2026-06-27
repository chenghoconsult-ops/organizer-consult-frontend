import { useState, type FormEvent } from 'react'
import type { ConsultationInput } from '../lib/api'
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
  TARGET_MONTH,
} from '../lib/labels'

interface FormState {
  serviceExperience: string
  housingPlan: string
  serviceArea: string
  targetMonth: string
  targetMonthOther: string
  serviceInterests: string[]
  consultTimeSlots: string[]
  moveInDate: string
  name: string
  email: string
  phone: string
  lineId: string
  altContact: string
  serviceAddress: string
  newHomeAddress: string
  budgetRange: string
  housingTypes: string[]
  housingTypeOther: string
  customerIdentity: string
  customerIdentityOther: string
  referralSource: string
  referralSourceOther: string
  additionalNotes: string
}

const EMPTY: FormState = {
  serviceExperience: '',
  housingPlan: '',
  serviceArea: '',
  targetMonth: '',
  targetMonthOther: '',
  serviceInterests: [],
  consultTimeSlots: [],
  moveInDate: '',
  name: '',
  email: '',
  phone: '',
  lineId: '',
  altContact: '',
  serviceAddress: '',
  newHomeAddress: '',
  budgetRange: '',
  housingTypes: [],
  housingTypeOther: '',
  customerIdentity: '',
  customerIdentityOther: '',
  referralSource: '',
  referralSourceOther: '',
  additionalNotes: '',
}

export function ConsultationForm({
  onSubmit,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onCancel,
  cancelLabel = '取消',
}: {
  onSubmit: (payload: ConsultationInput) => void
  submitting: boolean
  error?: string | null
  submitLabel: string
  submittingLabel: string
  onCancel?: () => void
  cancelLabel?: string
}) {
  const [f, setF] = useState<FormState>(EMPTY)
  const [validationError, setValidationError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setF((prev) => ({ ...prev, [key]: value }))

  const toggle = (key: 'serviceInterests' | 'consultTimeSlots' | 'housingTypes', v: string) =>
    setF((prev) => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
      }
    })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setValidationError(null)

    if (
      f.serviceInterests.length === 0 ||
      f.consultTimeSlots.length === 0 ||
      f.housingTypes.length === 0
    ) {
      setValidationError('請至少各勾選一項：想了解的服務、諮詢時段、房屋類型。')
      return
    }

    const clean = (s: string) => (s.trim() ? s.trim() : undefined)
    const payload: ConsultationInput = {
      serviceExperience: f.serviceExperience,
      housingPlan: f.housingPlan,
      serviceArea: f.serviceArea,
      targetMonth: f.targetMonth,
      targetMonthOther: clean(f.targetMonthOther),
      serviceInterests: f.serviceInterests,
      consultTimeSlots: f.consultTimeSlots,
      moveInDate: clean(f.moveInDate),
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      lineId: clean(f.lineId),
      altContact: clean(f.altContact),
      serviceAddress: f.serviceAddress.trim(),
      newHomeAddress: clean(f.newHomeAddress),
      budgetRange: f.budgetRange,
      housingTypes: f.housingTypes,
      housingTypeOther: clean(f.housingTypeOther),
      customerIdentity: f.customerIdentity,
      customerIdentityOther: clean(f.customerIdentityOther),
      referralSource: f.referralSource,
      referralSourceOther: clean(f.referralSourceOther),
      additionalNotes: clean(f.additionalNotes),
    }
    onSubmit(payload)
  }

  const shownError = validationError ?? error

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <Section title="客戶基本資料">
        <Text label="姓名（全名）" required value={f.name} onChange={(v) => set('name', v)} />
        <Text label="Email" type="email" required value={f.email} onChange={(v) => set('email', v)} />
        <Text label="聯絡電話" required value={f.phone} onChange={(v) => set('phone', v)} />
        <Text label="LINE ID" value={f.lineId} onChange={(v) => set('lineId', v)} />
        <Text label="其他聯絡方式" value={f.altContact} onChange={(v) => set('altContact', v)} />
      </Section>

      <Section title="需求">
        <Radio
          label="是否首次使用服務"
          required
          options={SERVICE_EXPERIENCE}
          value={f.serviceExperience}
          onChange={(v) => set('serviceExperience', v)}
        />
        <Radio
          label="是否換屋/裝修/搬家"
          required
          options={HOUSING_PLAN}
          value={f.housingPlan}
          onChange={(v) => set('housingPlan', v)}
        />
        <Radio
          label="服務區域"
          required
          options={SERVICE_AREA}
          value={f.serviceArea}
          onChange={(v) => set('serviceArea', v)}
        />
        <Radio
          label="希望完成月份"
          required
          options={TARGET_MONTH}
          value={f.targetMonth}
          onChange={(v) => set('targetMonth', v)}
        />
        {f.targetMonth === 'other' && (
          <Text label="月份（其他）" value={f.targetMonthOther} onChange={(v) => set('targetMonthOther', v)} />
        )}
        <Checks
          label="想了解的服務（多選）"
          required
          options={SERVICE_INTEREST}
          values={f.serviceInterests}
          onToggle={(v) => toggle('serviceInterests', v)}
        />
        <Checks
          label="希望諮詢時段（多選）"
          required
          options={CONSULT_TIME_SLOT}
          values={f.consultTimeSlots}
          onToggle={(v) => toggle('consultTimeSlots', v)}
        />
        <Radio
          label="預算區間"
          required
          options={BUDGET_RANGE}
          value={f.budgetRange}
          onChange={(v) => set('budgetRange', v)}
        />
      </Section>

      <Section title="房屋與身份">
        <Checks
          label="房屋類型（多選）"
          required
          options={HOUSING_TYPE}
          values={f.housingTypes}
          onToggle={(v) => toggle('housingTypes', v)}
        />
        <Text label="房屋類型（其他）" value={f.housingTypeOther} onChange={(v) => set('housingTypeOther', v)} />
        <Radio
          label="身份"
          required
          options={CUSTOMER_IDENTITY}
          value={f.customerIdentity}
          onChange={(v) => set('customerIdentity', v)}
        />
        <Text label="身份（其他）" value={f.customerIdentityOther} onChange={(v) => set('customerIdentityOther', v)} />
        <Radio
          label="認識管道"
          required
          options={REFERRAL_SOURCE}
          value={f.referralSource}
          onChange={(v) => set('referralSource', v)}
        />
        <Text label="認識管道（其他）" value={f.referralSourceOther} onChange={(v) => set('referralSourceOther', v)} />
      </Section>

      <Section title="地址與補充">
        <Text label="服務地址" required value={f.serviceAddress} onChange={(v) => set('serviceAddress', v)} />
        <Text label="新家地址（選填）" value={f.newHomeAddress} onChange={(v) => set('newHomeAddress', v)} />
        <Text label="搬入日期（選填）" value={f.moveInDate} onChange={(v) => set('moveInDate', v)} />
        <Area label="補充說明" value={f.additionalNotes} onChange={(v) => set('additionalNotes', v)} />
      </Section>

      {shownError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{shownError}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
      <legend className="px-1 text-sm font-semibold text-slate-900">{title}</legend>
      <div className="mt-2 space-y-4">{children}</div>
    </fieldset>
  )
}

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </span>
  )
}

function Text({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <label className="block">
      <Label label={label} required={required} />
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </label>
  )
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <Label label={label} />
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </label>
  )
}

function Radio({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string
  options: Record<string, string>
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div>
      <Label label={label} required={required} />
      <div className="mt-1 flex flex-wrap gap-2">
        {Object.entries(options).map(([k, v]) => (
          <button
            type="button"
            key={k}
            onClick={() => onChange(k)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              value === k
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

function Checks({
  label,
  options,
  values,
  onToggle,
  required,
}: {
  label: string
  options: Record<string, string>
  values: string[]
  onToggle: (v: string) => void
  required?: boolean
}) {
  return (
    <div>
      <Label label={label} required={required} />
      <div className="mt-1 flex flex-wrap gap-2">
        {Object.entries(options).map(([k, v]) => (
          <button
            type="button"
            key={k}
            onClick={() => onToggle(k)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              values.includes(k)
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
