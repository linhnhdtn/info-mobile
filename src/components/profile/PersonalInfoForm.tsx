import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { AvatarUpload } from "./AvatarUpload"
import { profileRepo } from "@/db/repositories/profile-repo"
import type { UserProfile } from "@/types"

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  birthday: z.string().optional(),
  bio: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function PersonalInfoForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "", lastName: "", phone: "", email: "",
      address: "", city: "", country: "", birthday: "", bio: "",
    },
  })

  useEffect(() => {
    profileRepo.get().then((data) => {
      if (data) {
        setProfile(data)
        setAvatarUrl(data.avatarUrl)
        form.reset({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          birthday: data.birthday ? data.birthday.split("T")[0] : "",
          bio: data.bio || "",
        })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: FormValues) {
    setSaving(true)
    try {
      const data = await profileRepo.update(values as Partial<UserProfile>)
      setProfile(data)
      toast.success("Thông tin cá nhân đã được lưu")
    } catch {
      toast.error("Không thể lưu thông tin")
    } finally {
      setSaving(false)
    }
  }

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "U"

  return (
    <div className="space-y-6">
      <AvatarUpload
        currentUrl={avatarUrl}
        displayName={displayName}
        onUploaded={setAvatarUrl}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel>Họ</FormLabel>
                <FormControl><Input placeholder="Nguyễn" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl><Input placeholder="Văn A" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Điện thoại</FormLabel>
                <FormControl><Input placeholder="0912345678" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input placeholder="email@example.com" type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="birthday" render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày sinh</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ</FormLabel>
              <FormControl><Input placeholder="123 Đường ABC" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel>Thành phố</FormLabel>
                <FormControl><Input placeholder="Hà Nội" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem>
                <FormLabel>Quốc gia</FormLabel>
                <FormControl><Input placeholder="Việt Nam" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem>
              <FormLabel>Giới thiệu</FormLabel>
              <FormControl><Textarea placeholder="Vài dòng về bạn..." rows={3} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
