import { Input } from "@/components/ui/input"

function formatWithDots(value: string): string {
  const num = value.replace(/\./g, "")
  if (!num) return ""
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

interface MoneyInputProps {
  value: string
  onChange: (raw: string) => void
  placeholder?: string
  className?: string
}

export function MoneyInput({ value, onChange, placeholder, className }: MoneyInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "")
    onChange(raw)
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      className={className}
      value={formatWithDots(value)}
      onChange={handleChange}
    />
  )
}
