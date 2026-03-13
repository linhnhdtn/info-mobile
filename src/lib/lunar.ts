// @ts-expect-error amlich has no type definitions
import amlich from "amlich"
const { convertSolar2Lunar, convertLunar2Solar } = amlich

const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]
const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]
const CON_GIAP = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"]

export interface LunarDateInfo {
  lunarDay: number
  lunarMonth: number
  lunarYear: number
  isLeapMonth: boolean
  canChiYear: string
  conGiap: string
  canChiDay: string
}

function getCanChiYear(lunarYear: number): string {
  const canIndex = (lunarYear + 6) % 10
  const chiIndex = (lunarYear + 8) % 12
  return `${THIEN_CAN[canIndex]} ${DIA_CHI[chiIndex]}`
}

function getConGiap(lunarYear: number): string {
  const chiIndex = (lunarYear + 8) % 12
  return CON_GIAP[chiIndex]
}

function getCanChiDay(dd: number, mm: number, yy: number): string {
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  const jdn = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  const canIndex = (jdn + 9) % 10
  const chiIndex = (jdn + 1) % 12
  return `${THIEN_CAN[canIndex]} ${DIA_CHI[chiIndex]}`
}

export function getSolarFromLunar(lunarDay: number, lunarMonth: number, lunarYear: number, isLeapMonth: boolean): { day: number; month: number; year: number } {
  const timeZone = 7
  const [day, month, year] = convertLunar2Solar(lunarDay, lunarMonth, lunarYear, isLeapMonth ? 1 : 0, timeZone) as [number, number, number]
  return { day, month, year }
}

export { getCanChiYear, getConGiap, getCanChiDay }

const HOANG_DAO_POSITIONS = [0, 1, 4, 5, 7, 10] as const
const SAO_NAMES = ["Thanh Long", "Minh Đường", "Thiên Hình", "Chu Tước", "Kim Quỹ", "Thiên Đức", "Bạch Hổ", "Ngọc Đường", "Thiên Lao", "Huyền Vũ", "Tư Mệnh", "Câu Trần"]
const GIO_RANGES = ["23-01", "01-03", "03-05", "05-07", "07-09", "09-11", "11-13", "13-15", "15-17", "17-19", "19-21", "21-23"]

export interface HoangDaoHour {
  chi: string
  sao: string
  timeRange: string
  isHoangDao: boolean
  startHour: number
  endHour: number
}

function getDayChiIndex(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  const jdn = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  return (jdn + 1) % 12
}

export function getHoangDaoHours(dd: number, mm: number, yy: number): HoangDaoHour[] {
  const chiOfDay = getDayChiIndex(dd, mm, yy)
  const startIndex = (chiOfDay % 6) * 2

  return Array.from({ length: 12 }, (_, i) => {
    const saoIndex = (i - startIndex + 12) % 12
    const isHoangDao = (HOANG_DAO_POSITIONS as readonly number[]).includes(saoIndex)
    const range = GIO_RANGES[i]
    const [startHour, endHour] = range.split("-").map(Number)
    return {
      chi: DIA_CHI[i],
      sao: SAO_NAMES[saoIndex],
      timeRange: range,
      isHoangDao,
      startHour,
      endHour,
    }
  })
}

export function getLunarDateInfo(date: Date): LunarDateInfo {
  const dd = date.getDate()
  const mm = date.getMonth() + 1
  const yy = date.getFullYear()
  const timeZone = 7

  const [lunarDay, lunarMonth, lunarYear, lunarLeap] = convertSolar2Lunar(dd, mm, yy, timeZone) as [number, number, number, number]

  return {
    lunarDay,
    lunarMonth,
    lunarYear,
    isLeapMonth: lunarLeap === 1,
    canChiYear: getCanChiYear(lunarYear),
    conGiap: getConGiap(lunarYear),
    canChiDay: getCanChiDay(dd, mm, yy),
  }
}
