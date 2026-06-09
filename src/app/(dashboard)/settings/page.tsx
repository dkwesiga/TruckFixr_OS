import { CopyButton } from "@/components/shared/CopyButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle>Workspace settings</CardTitle>
          <CardDescription>
            Demo inputs for future persistence, export, and operator controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="ops">Ops</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="general">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="workspace-name">Workspace name</Label>
                  <Input
                    id="workspace-name"
                    defaultValue="TruckFixr OS"
                    placeholder="Workspace name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Default review cadence</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select cadence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Cadence</SelectLabel>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 lg:col-span-2">
                  <Label htmlFor="workspace-notes">Operator notes</Label>
                  <Textarea
                    id="workspace-notes"
                    defaultValue="Use this area for internal guidance once each module starts carrying real data."
                    rows={5}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent className="mt-4" value="ops">
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  This placeholder keeps space open for audit preferences,
                  export rules, and future admin controls.
                </div>
                <CopyButton
                  label="Copy env key"
                  text="NEXT_PUBLIC_INTERNAL_DASHBOARD_PASSWORD"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
