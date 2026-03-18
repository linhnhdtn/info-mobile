export interface GoldPrice {
  type_code: string
  buy: number
  sell: number
  change_buy: number
  change_sell: number
}

export interface GoldPrices {
  [code: string]: GoldPrice
}

const CACHE_KEY = "gold-prices"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CachedPrices {
  prices: GoldPrices
  fetchedAt: number
}

function loadCached(): GoldPrices | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const cached: CachedPrices = JSON.parse(raw)
      if (Date.now() - cached.fetchedAt < CACHE_DURATION) {
        return cached.prices
      }
    }
  } catch {}
  return null
}

export async function fetchGoldPrices(): Promise<GoldPrices> {
  const cached = loadCached()
  if (cached) return cached

  const res = await fetch("https://vang.today/api/prices?action=current")
  if (!res.ok) throw new Error("Không thể tải giá vàng")

  const json = await res.json()
  if (!json.success) throw new Error("API trả về lỗi")

  // API returns { data: [ { type_code, buy, sell, ... } ] }
  // Convert array to map keyed by type_code
  const prices: GoldPrices = {}
  for (const item of json.data) {
    prices[item.type_code] = item
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify({ prices, fetchedAt: Date.now() }))
  return prices
}

// Giá API tính theo lượng (1 lượng = 10 chỉ)
export const CHI_PER_LUONG = 10

export const POPULAR_GOLD_TYPES = [
  { code: "SJ9999", name: "SJC 9999" },
  { code: "SJL1L10", name: "SJC Lẻ 1L-10L" },
  { code: "DOHNL", name: "DOJI Hà Nội" },
  { code: "DOHCML", name: "DOJI HCM" },
  { code: "BTSJC", name: "Bảo Tín SJC" },
  { code: "BT9999NTT", name: "Bảo Tín 9999 Nhẫn" },
  { code: "VNGSJC", name: "Vàng Việt Nam SJC" },
  { code: "PQHNVM", name: "Phú Quý Hà Nội" },
  { code: "PQHN24NTT", name: "Phú Quý 24K Nhẫn" },
  { code: "VIETTINMSJC", name: "Việt Tín SJC" },
] as const

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ"
}
