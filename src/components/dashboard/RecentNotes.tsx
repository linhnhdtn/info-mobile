import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { noteRepo } from "@/db/repositories/note-repo"
import type { Note } from "@/types"

export function RecentNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    noteRepo.getAll()
      .then((data) => {
        setNotes(data.slice(0, 4))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Ghi chú gần đây</CardTitle>
        <Link to="/notes" className="text-xs text-blue-600 hover:underline">Xem tất cả →</Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Chưa có ghi chú nào</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notes.map((note) => (
              <Link key={note.id} to="/notes">
                <div
                  className="rounded-md p-3 border hover:shadow-sm transition-shadow cursor-pointer h-full"
                  style={{ backgroundColor: note.color || "#FFFFFF" }}
                >
                  {note.title && (
                    <p className="text-xs font-semibold text-gray-800 truncate mb-1">{note.title}</p>
                  )}
                  <p className="text-xs text-gray-600 line-clamp-3">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {note.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0 text-gray-500">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
