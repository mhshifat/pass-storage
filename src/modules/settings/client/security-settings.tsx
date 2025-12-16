"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function SecuritySettings() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Password Policies</CardTitle>
          <CardDescription>
            Define password strength and complexity requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="min-length">Minimum Password Length</Label>
            <Input id="min-length" type="number" defaultValue="12" />
            <p className="text-xs text-muted-foreground">Minimum number of characters required</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Uppercase Letters</Label>
              <p className="text-xs text-muted-foreground">At least one uppercase letter (A-Z)</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Lowercase Letters</Label>
              <p className="text-xs text-muted-foreground">At least one lowercase letter (a-z)</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Numbers</Label>
              <p className="text-xs text-muted-foreground">At least one number (0-9)</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Special Characters</Label>
              <p className="text-xs text-muted-foreground">
                At least one special character (!@#$%...)
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="password-expiry">Password Expiry (days)</Label>
            <Input id="password-expiry" type="number" defaultValue="90" />
            <p className="text-xs text-muted-foreground">
              Number of days before password must be changed (0 = never)
            </p>
          </div>

          <div className="pt-4">
            <Button>Save Password Policies</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Configure user session and timeout settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input id="session-timeout" type="number" defaultValue="30" />
            <p className="text-xs text-muted-foreground">
              Automatically log out inactive users after this time
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-sessions">Maximum Concurrent Sessions</Label>
            <Input id="max-sessions" type="number" defaultValue="3" />
            <p className="text-xs text-muted-foreground">
              Maximum number of active sessions per user
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Re-authentication for Sensitive Actions</Label>
              <p className="text-xs text-muted-foreground">
                Require password confirmation for critical operations
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="pt-4">
            <Button>Save Session Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Security</CardTitle>
          <CardDescription>Configure login attempt limits and account lockout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Maximum Failed Login Attempts</Label>
            <Input id="max-attempts" type="number" defaultValue="5" />
            <p className="text-xs text-muted-foreground">
              Lock account after this many failed attempts
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
            <Input id="lockout-duration" type="number" defaultValue="15" />
            <p className="text-xs text-muted-foreground">How long to lock the account</p>
          </div>

          <div className="pt-4">
            <Button>Save Login Security</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
