import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm"
import { WorkInfoForm } from "@/components/profile/WorkInfoForm"

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ</h2>
      <Tabs defaultValue="personal">
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Cá nhân</TabsTrigger>
          <TabsTrigger value="work">Công việc</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkInfoForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
