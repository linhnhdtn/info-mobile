import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { workRepo } from "@/db/repositories/work-repo"
import type { WorkInfo } from "@/types"

const schema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  workEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  workPhone: z.string().optional(),
  workAddress: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function WorkInfoForm() {
  const [saving, setSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: "", position: "", department: "", employeeId: "",
      workEmail: "", workPhone: "", workAddress: "",
      startDate: "", endDate: "", salary: "", notes: "",
    },
  })

  useEffect(() => {
    workRepo.get().then((data) => {
      if (data) {
        form.reset({
          company: data.company || "",
          position: data.position || "",
          department: data.department || "",
          employeeId: data.employeeId || "",
          workEmail: data.workEmail || "",
          workPhone: data.workPhone || "",
          workAddress: data.workAddress || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
          salary: data.salary || "",
          notes: data.notes || "",
        })
      }
    })
  }, [form])

  async function onSubmit(values: FormValues) {
    setSaving(true)
    try {
      await workRepo.update(values as Partial<WorkInfo>)
      toast.success("Thông tin công việc đã được lưu")
    } catch {
      toast.error("Không thể lưu thông tin")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="company" render={({ field }) => (
            <FormItem>
              <FormLabel>Công ty</FormLabel>
              <FormControl><Input placeholder="Tên công ty" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="position" render={({ field }) => (
            <FormItem>
              <FormLabel>Vị trí</FormLabel>
              <FormControl><Input placeholder="Software Engineer" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem>
              <FormLabel>Phòng ban</FormLabel>
              <FormControl><Input placeholder="Engineering" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="employeeId" render={({ field }) => (
            <FormItem>
              <FormLabel>Mã nhân viên</FormLabel>
              <FormControl><Input placeholder="EMP001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="workEmail" render={({ field }) => (
            <FormItem>
              <FormLabel>Email công ty</FormLabel>
              <FormControl><Input type="email" placeholder="work@company.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="workPhone" render={({ field }) => (
            <FormItem>
              <FormLabel>SĐT công ty</FormLabel>
              <FormControl><Input placeholder="024 1234 5678" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="workAddress" render={({ field }) => (
          <FormItem>
            <FormLabel>Địa chỉ công ty</FormLabel>
            <FormControl><Input placeholder="123 Đường XYZ, Hà Nội" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="startDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày bắt đầu</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="endDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày kết thúc</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="salary" render={({ field }) => (
          <FormItem>
            <FormLabel>Lương</FormLabel>
            <FormControl><Input placeholder="15,000,000 VND" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú</FormLabel>
            <FormControl><Textarea placeholder="Các thông tin khác..." rows={3} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>
    </Form>
  )
}
