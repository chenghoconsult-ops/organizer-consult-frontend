import type { CaseStatus } from './api'

// 案件狀態 1–13（線性流程）。索引 +1 即步驟編號。
export const STATUS_ORDER: CaseStatus[] = [
  'dataProvided',
  'onlineConsultScheduled',
  'onlineConsultDone',
  'siteSurveyScheduled',
  'siteSurveyDone',
  'quoteProvided',
  'depositReceived',
  'serviceDone',
  'balanceBillProvided',
  'balancePaid',
  'invoiceIssued',
  'reviewReceived',
  'closed',
]

export const STATUS_LABELS: Record<CaseStatus, string> = {
  dataProvided: '已提供資料',
  onlineConsultScheduled: '已安排線上諮詢',
  onlineConsultDone: '已完成線上諮詢',
  siteSurveyScheduled: '已安排場勘',
  siteSurveyDone: '已完成場勘',
  quoteProvided: '已提供估價單',
  depositReceived: '已收到訂金',
  serviceDone: '已完成服務',
  balanceBillProvided: '已提供尾款單',
  balancePaid: '已收到尾款',
  invoiceIssued: '已開立發票',
  reviewReceived: '已獲得客戶評價',
  closed: '已結案',
}

export function statusStep(status: CaseStatus): number {
  return STATUS_ORDER.indexOf(status) + 1
}

export function nextStatus(status: CaseStatus): CaseStatus | null {
  const i = STATUS_ORDER.indexOf(status)
  return STATUS_ORDER[i + 1] ?? null
}

// --- 諮詢表單 enum 中文標籤 ---

export const SERVICE_EXPERIENCE: Record<string, string> = {
  firstTime: '是，第一次使用相關服務',
  returning: '否，之前有使用過相關服務',
}

export const HOUSING_PLAN: Record<string, string> = {
  newHome: '是 → 成家方案介紹',
  existingUpgrade: '否 → 原屋優化改造方案',
}

export const SERVICE_AREA: Record<string, string> = {
  keelung: '基隆市',
  taipei: '臺北市',
  newTaipei: '新北市',
  taoyuan: '桃園市',
  hsinchuCity: '新竹市',
  hsinchuCounty: '新竹縣',
}

// 希望完成月份以 "YYYY-MM" 字串儲存，顯示為「2026 年 7 月」。
export function formatTargetMonth(v: string): string {
  const [y, m] = v.split('-')
  return m ? `${y} 年 ${Number(m)} 月` : v
}

// 想了解的服務：選項依 housingPlan 分流。
// 是 → 成家方案（newHome）：沿用原本 6 項。
export const SERVICE_INTEREST_NEW_HOME: Record<string, string> = {
  designPlanning: 'A. 裝修前-收納設計規劃',
  sortingPacking: 'B. 舊家物品檢視、分類打包',
  moving: 'C. 搬運（有配合的搬運公司）',
  unboxingShelving: 'D. 新家開箱上架',
  storageShopping: 'E. 新家收納品採購規劃',
  notSureConsult: '不知道，跟顧問聊聊',
}

// 否 → 原屋優化改造方案（existingUpgrade）：7 項。
export const SERVICE_INTEREST_EXISTING: Record<string, string> = {
  publicSpaceOrganizing: '好感家事收納規劃-公共空間',
  bedroomClothingOrganizing: '高效衣物管理收納規劃-臥室空間',
  kidsSpacePlanning: '成長式育兒空間規劃',
  smallHomeStorageDesign: '小宅收納設計規劃',
  onlineGuidanceRemote: '其他縣市、海外線上收納指導',
  charityApplication: '公益案件申請',
  notSureWhereToStart: '不知道該從何開始，想跟顧問聊聊',
}

// 顯示用（CaseDetail / mapList）：涵蓋全部 13 個值。
export const SERVICE_INTEREST: Record<string, string> = {
  ...SERVICE_INTEREST_NEW_HOME,
  ...SERVICE_INTEREST_EXISTING,
}

// 依 housingPlan 取得對應的服務選項（未選 housingPlan 時回傳空集合）。
export function serviceInterestOptions(housingPlan: string): Record<string, string> {
  if (housingPlan === 'existingUpgrade') return SERVICE_INTEREST_EXISTING
  if (housingPlan === 'newHome') return SERVICE_INTEREST_NEW_HOME
  return {}
}

export const CONSULT_TIME_SLOT: Record<string, string> = {
  weekdayMorning: '平日 上午 09:30-12:00',
  weekdayAfternoon: '平日 下午 14:00-17:00',
  weekdayEvening: '平日 晚上 20:00-22:00',
  weekendMorning: '週末 上午 09:30-12:00',
  weekendEvening: '週末 晚上 20:00-22:00',
}

export const INTERIOR_AREA: Record<string, string> = {
  under10: '10 坪以下',
  range10to19: '10-19 坪',
  range20to29: '20-29 坪',
  range30to39: '30-39 坪',
  range40to49: '40-49 坪',
  from50: '50 坪以上',
}

// 建議預算區間：依 housingPlan + interiorArea 推導（不存 DB，僅供顯示）。
const SUGGESTED_BUDGET: Record<string, Record<string, string>> = {
  existingUpgrade: {
    under10: '$13,600 起',
    range10to19: '$27,200 起',
    range20to29: '$40,800 起',
    range30to39: '$47,400 起',
    range40to49: '$54,400 起',
    from50: '另議',
  },
  newHome: {
    under10: '$27,000 起',
    range10to19: '$40,800 起',
    range20to29: '$68,000 起',
    range30to39: '$81,600 起',
    range40to49: '$95,200 起',
    from50: '另議',
  },
}

export function suggestedBudget(housingPlan: string, interiorArea: string): string {
  return SUGGESTED_BUDGET[housingPlan]?.[interiorArea] ?? ''
}

// 坪數選擇器下方的說明文字（依 housingPlan 不同）。
export const INTERIOR_AREA_NOTE: Record<string, string> = {
  existingUpgrade: '室內實坪數＆建議預算區間（不含採購費）',
  newHome: '室內實坪數＆建議預算區間（舊家＋新家，不含搬運、採購費）',
}

export const HOUSING_TYPE: Record<string, string> = {
  rentLandlord: '租屋（房東）',
  rentFamily: '租屋（父母、親戚家）',
  ownWithFamily: '自住房（與家人同住）',
  ownAlone: '自住房（未與家人同住）',
  apartment: '公寓大樓',
  townhouse: '透天厝',
  hasPet: '有寵物',
  chaseGarbageTruck: '追垃圾車',
  communityGarbageStation: '有社區垃圾場',
  paidGarbageBag: '需付費垃圾袋',
  hasElevator: '有電梯',
  noAirConditioning: '無冷氣',
}

export const CUSTOMER_IDENTITY: Record<string, string> = {
  firstTimeBooking: '首次預約',
  returningCustomer: '舊顧客再度預約',
  courseStudent: '課程學員',
}

export const REFERRAL_SOURCE: Record<string, string> = {
  socialFbIg: '社群 FB/IG',
  youtube: 'YouTube',
  googleMaps: 'Google 商家地圖',
  googleSearch: 'Google 關鍵字搜尋',
  referralFriend: '介紹-親友',
  referralIndustry: '介紹-居家產業人士',
  onlineVideo: '網路影音',
}
