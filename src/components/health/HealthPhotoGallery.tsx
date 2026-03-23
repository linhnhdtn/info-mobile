import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Download, X, Loader2 } from "lucide-react"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Capacitor } from "@capacitor/core"
import { healthRepo } from "@/db/repositories/health-repo"
import type { HealthPhoto } from "@/types"
import { toast } from "sonner"

interface HealthPhotoGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  healthLogId: string
  date: string
  photos: HealthPhoto[]
  onChanged: () => void
}

export function HealthPhotoGallery({ open, onOpenChange, healthLogId, date, photos, onChanged }: HealthPhotoGalleryProps) {
  const [uploading, setUploading] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<HealthPhoto | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    try {
      let uploadedCount = 0
      for (const file of Array.from(files)) {
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const fileName = `health_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${file.name.split(".").pop()}`

        let filePath: string
        if (Capacitor.isNativePlatform()) {
          await Filesystem.writeFile({
            path: `health/${date}/${fileName}`,
            data: base64,
            directory: Directory.Data,
            recursive: true,
          })
          const fileUri = await Filesystem.getUri({
            path: `health/${date}/${fileName}`,
            directory: Directory.Data,
          })
          filePath = Capacitor.convertFileSrc(fileUri.uri)
        } else {
          filePath = `data:${file.type};base64,${base64}`
        }

        await healthRepo.addPhoto(healthLogId, filePath)
        uploadedCount++
      }
      toast.success(`Đã tải ${uploadedCount} ảnh`)
      onChanged()
    } catch {
      toast.error("Lỗi khi tải ảnh")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(photo: HealthPhoto) {
    try {
      await healthRepo.deletePhoto(photo.id)
      if (viewPhoto?.id === photo.id) setViewPhoto(null)
      toast.success("Đã xóa ảnh")
      onChanged()
    } catch {
      toast.error("Lỗi khi xóa ảnh")
    }
  }

  async function handleDownload(photo: HealthPhoto) {
    try {
      if (Capacitor.isNativePlatform()) {
        // Extract the original path from the converted file src
        // filePath looks like: https://localhost/_capacitor_file_/data/user/0/com.canhan.info/files/health/2026-03-23/file.jpg
        // We need to find and copy from our Data directory
        const pathMatch = photo.filePath.match(/health\/[^?]+/)
        if (!pathMatch) { toast.error("Không tìm thấy file"); return }
        const srcPath = pathMatch[0]
        const fileName = srcPath.split("/").pop() || `health_${photo.id.slice(0, 8)}.jpg`

        // Read from app data and write to Downloads
        const fileData = await Filesystem.readFile({
          path: srcPath,
          directory: Directory.Data,
        })
        await Filesystem.writeFile({
          path: `Download/${fileName}`,
          data: fileData.data,
          directory: Directory.ExternalStorage,
          recursive: true,
        })
        toast.success("Đã lưu vào thư mục Download")
      } else {
        const link = document.createElement("a")
        link.href = photo.filePath
        link.download = `health_${date}_${photo.id.slice(0, 8)}.jpg`
        link.click()
        toast.success("Đang tải ảnh")
      }
    } catch {
      toast.error("Lỗi khi tải ảnh")
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Ảnh - {date}</span>
              <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Thêm ảnh
              </Button>
            </DialogTitle>
          </DialogHeader>

          {photos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Chưa có ảnh nào</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => inputRef.current?.click()}>
                <Plus className="h-4 w-4 mr-1" /> Tải ảnh lên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={photo.filePath}
                    alt={photo.caption || "Health photo"}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setViewPhoto(photo)}
                  />
                </div>
              ))}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
              e.target.value = ""
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Full-screen photo viewer */}
      <Dialog open={!!viewPhoto} onOpenChange={() => setViewPhoto(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95">
          {viewPhoto && (
            <div className="relative flex flex-col h-[90vh]">
              <div className="flex-1 flex items-center justify-center min-h-0">
                <img
                  src={viewPhoto.filePath}
                  alt={viewPhoto.caption || "Health photo"}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-black/80">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 gap-2 h-11 px-4"
                  onClick={() => handleDownload(viewPhoto)}
                >
                  <Download className="h-5 w-5" />
                  <span className="text-sm">Tải về</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-11 w-11"
                  onClick={() => setViewPhoto(null)}
                >
                  <X className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-400 hover:bg-white/20 gap-2 h-11 px-4"
                  onClick={() => handleDelete(viewPhoto)}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="text-sm">Xóa</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
