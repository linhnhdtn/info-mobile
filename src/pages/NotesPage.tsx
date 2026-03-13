import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { NoteCard } from "@/components/notes/NoteCard"
import { NoteEditor } from "@/components/notes/NoteEditor"
import { NoteFilters } from "@/components/notes/NoteFilters"
import { Skeleton } from "@/components/ui/skeleton"
import { noteRepo } from "@/db/repositories/note-repo"
import { useAppResume } from "@/lib/useAppResume"
import type { Note } from "@/types"
import { toast } from "sonner"

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  async function loadNotes() {
    const data = await noteRepo.getAll(search || undefined, selectedTag || undefined)
    setNotes(data)
    setLoading(false)
  }

  useEffect(() => {
    loadNotes()
  }, [search, selectedTag])

  useAppResume(loadNotes)

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [notes])

  const pinned = notes.filter((n) => n.isPinned)
  const unpinned = notes.filter((n) => !n.isPinned)

  function openNew() {
    setEditingNote(null)
    setEditorOpen(true)
  }

  function openEdit(note: Note) {
    setEditingNote(note)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá ghi chú này?")) return
    await noteRepo.delete(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
    toast.success("Đã xoá ghi chú")
  }

  async function handleTogglePin(note: Note) {
    const updated = await noteRepo.update(note.id, { isPinned: !note.isPinned })
    if (updated) {
      setNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n))
    }
  }

  function handleSaved(saved: Note) {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ghi chú</h2>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm ghi chú
        </Button>
      </div>

      <NoteFilters
        search={search}
        onSearchChange={setSearch}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        allTags={allTags}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Đã ghim
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinned.map((note) => (
                  <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} />
                ))}
              </div>
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Tất cả ghi chú
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unpinned.map((note) => (
                  <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} />
                ))}
              </div>
            </div>
          )}
          {notes.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p>Chưa có ghi chú nào. Bắt đầu tạo ngay!</p>
            </div>
          )}
        </>
      )}

      <NoteEditor
        note={editingNote}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}
