import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface NoteFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  selectedTag: string
  onTagChange: (v: string) => void
  allTags: string[]
}

export function NoteFilters({ search, onSearchChange, selectedTag, onTagChange, allTags }: NoteFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm ghi chú..."
          className="pl-8"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={!selectedTag ? "default" : "outline"}
            size="sm"
            onClick={() => onTagChange("")}
          >
            Tất cả
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => onTagChange(selectedTag === tag ? "" : tag)}
            >
              #{tag}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
