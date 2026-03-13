import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Capacitor } from "@capacitor/core"
import { profileRepo } from "@/db/repositories/profile-repo"

interface AvatarUploadProps {
  currentUrl?: string | null
  displayName?: string
  onUploaded: (url: string) => void
}

export function AvatarUpload({ currentUrl, displayName = "U", onUploaded }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (currentUrl) setPreview(currentUrl)
  }, [currentUrl])
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(",")[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const fileName = `avatar_${Date.now()}.${file.name.split(".").pop()}`

      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: `avatars/${fileName}`,
          data: base64,
          directory: Directory.Data,
          recursive: true,
        })
        const fileUri = await Filesystem.getUri({
          path: `avatars/${fileName}`,
          directory: Directory.Data,
        })
        const url = Capacitor.convertFileSrc(fileUri.uri)
        setPreview(url)
        await profileRepo.updateAvatar(url)
        onUploaded(url)
      } else {
        // Web fallback: use data URL
        const dataUrl = `data:${file.type};base64,${base64}`
        setPreview(dataUrl)
        await profileRepo.updateAvatar(dataUrl)
        onUploaded(dataUrl)
      }
      toast.success("Ảnh đại diện đã được cập nhật")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload thất bại")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-24 w-24">
          {preview && <AvatarImage src={preview} alt="Avatar" />}
          <AvatarFallback className="text-2xl">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90 transition-colors"
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
        </button>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Đang tải..." : "Thay đổi ảnh"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
