import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pin, PinOff, MoreVertical, Pencil, Trash2 } from "lucide-react"
import type { Note } from "@/types"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (note: Note) => void
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow relative group"
      style={{ backgroundColor: note.color || "#FFFFFF" }}
      onClick={() => onEdit(note)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {note.title && (
            <h3 className="font-semibold text-sm text-gray-900 truncate">{note.title}</h3>
          )}
          <p className="text-sm text-gray-700 line-clamp-4 mt-0.5 whitespace-pre-wrap">{note.content}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onTogglePin(note)}
            className="p-1 rounded hover:bg-black/10 transition-colors"
            title={note.isPinned ? "Bỏ ghim" : "Ghim"}
          >
            {note.isPinned ? <Pin className="h-3.5 w-3.5 fill-current" /> : <PinOff className="h-3.5 w-3.5" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="p-1 rounded hover:bg-black/10 transition-colors">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(note)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(note.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-auto">
        {new Date(note.updatedAt).toLocaleDateString("vi-VN")}
      </p>
    </div>
  )
}
