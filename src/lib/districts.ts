import { SERVICE_AREA } from './labels'

// 各服務縣市的行政區（區/鄉/鎮/市），key 對應 ServiceArea enum code。
// 用於 縣市 → 區域 連動下拉，以及由完整地址自動帶出縣市/區域。
export const DISTRICTS: Record<string, string[]> = {
  keelung: ['中正區', '七堵區', '暖暖區', '仁愛區', '中山區', '安樂區', '信義區'],
  taipei: [
    '中正區', '大同區', '中山區', '松山區', '大安區', '萬華區',
    '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區',
  ],
  newTaipei: [
    '板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區',
    '鶯歌區', '三峽區', '淡水區', '汐止區', '瑞芳區', '土城區', '蘆洲區',
    '五股區', '泰山區', '林口區', '深坑區', '石碇區', '坪林區', '三芝區',
    '石門區', '八里區', '平溪區', '雙溪區', '貢寮區', '金山區', '萬里區', '烏來區',
  ],
  taoyuan: [
    '桃園區', '中壢區', '大溪區', '楊梅區', '蘆竹區', '大園區', '龜山區',
    '八德區', '龍潭區', '平鎮區', '新屋區', '觀音區', '復興區',
  ],
  hsinchuCity: ['東區', '北區', '香山區'],
  hsinchuCounty: [
    '竹北市', '竹東鎮', '新埔鎮', '關西鎮', '湖口鄉', '新豐鄉', '芎林鄉',
    '橫山鄉', '北埔鄉', '寶山鄉', '峨眉鄉', '尖石鄉', '五峰鄉',
  ],
}

// 台/臺 互通：統一成「台」再比對。
const normalize = (s: string) => s.replace(/臺/g, '台')

// 由貼上的完整地址嘗試帶出 縣市 / 區域（皆回傳 enum code）。
// 找出最先出現的縣市，再於該縣市的行政區清單中找出地址包含的區域。
export function parseAddress(addr: string): { city?: string; district?: string } {
  const text = normalize(addr)

  let city: string | undefined
  let cityPos = Infinity
  for (const code of Object.keys(SERVICE_AREA)) {
    const pos = text.indexOf(normalize(SERVICE_AREA[code]))
    if (pos !== -1 && pos < cityPos) {
      cityPos = pos
      city = code
    }
  }
  if (!city) return {}

  const district = DISTRICTS[city].find((d) => text.includes(normalize(d)))
  return { city, district }
}

// 檢查所選的縣市/區域是否與完整地址相符（地址須同時包含縣市名稱與區域）。
// 用於送出前驗證：避免手動改了下拉選單後與地址不一致。
export function addressMatchesArea(
  addr: string,
  cityCode: string,
  district: string,
): boolean {
  const cityLabel = SERVICE_AREA[cityCode]
  if (!cityLabel || !district) return false
  const text = normalize(addr)
  return text.includes(normalize(cityLabel)) && text.includes(normalize(district))
}
