import { useState, type KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("")

  function addTag(value: string) {
    const trimmed = value.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput("")
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="border rounded-md px-2 py-1.5 flex flex-wrap gap-1.5 min-h-9 focus-within:ring-1 focus-within:ring-ring">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 text-xs">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? "Nhập tag rồi Enter..." : ""}
        className="flex-1 min-w-24 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
      />
    </div>
  )
}
