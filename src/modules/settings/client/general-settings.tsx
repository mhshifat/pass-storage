"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function GeneralSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>Configure general application settings and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="app-name">Application Name</Label>
          <Input id="app-name" defaultValue="PassStorage" />
          <p className="text-xs text-muted-foreground">
            The name displayed throughout the application
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="app-url">Application URL</Label>
          <Input id="app-url" defaultValue="https://passstorage.company.com" />
          <p className="text-xs text-muted-foreground">
            The base URL for accessing the application
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="timezone">Default Timezone</Label>
          <Select defaultValue="utc">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">UTC</SelectItem>
              <SelectItem value="est">Eastern Time</SelectItem>
              <SelectItem value="pst">Pacific Time</SelectItem>
              <SelectItem value="gmt">GMT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="language">Default Language</Label>
          <Select defaultValue="en">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Maintenance Mode</Label>
            <p className="text-xs text-muted-foreground">Disable access for non-admin users</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>User Registration</Label>
            <p className="text-xs text-muted-foreground">Allow new users to register</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="pt-4">
          <Button>Save General Settings</Button>
        </div>
      </CardContent>
    </Card>
  )
}
