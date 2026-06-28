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
} from '../lib/labels'
import { DISTRICTS, addressMatchesArea, parseAddress } from '../lib/districts'

interface FormState {
  serviceExperience: string
  housingPlan: string
  serviceArea: string
  serviceDistrict: string
  targetMonth: string
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
  serviceDistrict: '',
  targetMonth: '',
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
  const currentMonth = new Date().toISOString().slice(0, 7)

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

  // 服務地址：使用者貼上完整地址時，自動帶出縣市/區域（解析不到就維持手選的值）。
  const setAddress = (v: string) =>
    setF((prev) => {
      const next = { ...prev, serviceAddress: v }
      const { city, district } = parseAddress(v)
      if (city) {
        if (city !== prev.serviceArea) next.serviceDistrict = ''
        next.serviceArea = city
        if (district) next.serviceDistrict = district
      }
      return next
    })

  // 縣市改變時清空區域（避免殘留前一個縣市的區域）。
  const setCity = (v: string) =>
    setF((prev) => ({ ...prev, serviceArea: v, serviceDistrict: '' }))

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

    if (!addressMatchesArea(f.serviceAddress, f.serviceArea, f.serviceDistrict)) {
      setValidationError('服務地址與所選的縣市／區域不符，請確認地址是否包含所選縣市與區域。')
      return
    }

    const clean = (s: string) => (s.trim() ? s.trim() : undefined)
    const payload: ConsultationInput = {
      serviceExperience: f.serviceExperience,
      housingPlan: f.housingPlan,
      serviceArea: f.serviceArea,
      serviceDistrict: f.serviceDistrict,
      targetMonth: f.targetMonth,
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
        <MonthPicker
          label="希望完成月份"
          required
          min={currentMonth}
          value={f.targetMonth}
          onChange={(v) => set('targetMonth', v)}
        />
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
        <AreaSelect
          required
          city={f.serviceArea}
          district={f.serviceDistrict}
          onCity={setCity}
          onDistrict={(v) => set('serviceDistrict', v)}
        />
        <Text label="服務地址" required value={f.serviceAddress} onChange={setAddress} />
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

// 服務縣市 + 區域：兩個連動下拉（縣市決定區域選項）。使用原生 <select>，
// 中文選項由系統正常顯示（不像 <input type="month"> 會受瀏覽器語系影響）。
function AreaSelect({
  city,
  district,
  onCity,
  onDistrict,
  required,
}: {
  city: string
  district: string
  onCity: (v: string) => void
  onDistrict: (v: string) => void
  required?: boolean
}) {
  const cls =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 disabled:bg-slate-100 disabled:text-slate-400'
  const districts = city ? DISTRICTS[city] ?? [] : []

  return (
    <div>
      <Label label="服務縣市 / 區域" required={required} />
      <div className="mt-1 flex gap-2">
        <select
          required={required}
          value={city}
          onChange={(e) => onCity(e.target.value)}
          className={cls}
        >
          <option value="" disabled>
            縣市
          </option>
          {Object.entries(SERVICE_AREA).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          required={required}
          value={district}
          onChange={(e) => onDistrict(e.target.value)}
          disabled={!city}
          className={cls}
        >
          <option value="" disabled>
            區域
          </option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

const CHINESE_MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
]

// 希望完成月份：年 + 月 兩個下拉，固定中文月份（不依賴瀏覽器語系），
// 值以 "YYYY-MM" 字串輸出。min（"YYYY-MM"）限制不可選擇早於當月。
function MonthPicker({
  label,
  value,
  onChange,
  required,
  min,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  min: string
}) {
  const [minYear, minMonth] = min.split('-').map(Number)
  const initial = value ? value.split('-').map(Number) : [0, 0]
  // 年/月分開保存，使用者只選了年（還沒選月）時也要記住，否則無法限制當年的月份。
  const [year, setYear] = useState(initial[0])
  const [month, setMonth] = useState(initial[1])
  // 可選年份：當年 + 明年（minYear 來自 min，即當月，故隨系統時間變動）
  const years = [minYear, minYear + 1]

  const emit = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
    onChange(y && m ? `${y}-${String(m).padStart(2, '0')}` : '')
  }

  const cls =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900'

  return (
    <div>
      <Label label={label} required={required} />
      <div className="mt-1 flex gap-2">
        <select
          required={required}
          value={year || ''}
          onChange={(e) => {
            const y = Number(e.target.value)
            // 若改為當年且原本選的月份已早於 min，清除月份
            const m = month && (y > minYear || month >= minMonth) ? month : 0
            emit(y, m)
          }}
          className={cls}
        >
          <option value="" disabled>
            年
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y} 年
            </option>
          ))}
        </select>
        <select
          required={required}
          value={month || ''}
          onChange={(e) => emit(year, Number(e.target.value))}
          className={cls}
        >
          <option value="" disabled>
            月
          </option>
          {CHINESE_MONTHS.map((name, idx) => (
            <option key={idx} value={idx + 1} disabled={year === minYear && idx + 1 < minMonth}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
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
