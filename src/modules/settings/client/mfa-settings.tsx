"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function MfaSettings() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>Configure MFA requirements and options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enforce MFA for All Users</Label>
              <p className="text-xs text-muted-foreground">Require all users to enable MFA</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enforce MFA for Admins</Label>
              <p className="text-xs text-muted-foreground">Require admin users to enable MFA</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div>
            <Label className="text-base">Available MFA Methods</Label>
            <p className="text-xs text-muted-foreground mb-4">
              Select which MFA methods users can choose from
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <Label>Authenticator App (TOTP)</Label>
                    <p className="text-xs text-muted-foreground">
                      Google Authenticator, Authy, etc.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Recommended</Badge>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <Label>SMS Authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      Send verification codes via SMS
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <Label>Email Authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      Send verification codes via email
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <Label>Hardware Security Keys</Label>
                    <p className="text-xs text-muted-foreground">
                      YubiKey, Titan Security Key, etc.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Most Secure</Badge>
                  <Switch />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="grace-period">MFA Enforcement Grace Period (days)</Label>
            <Input id="grace-period" type="number" defaultValue="7" />
            <p className="text-xs text-muted-foreground">
              Allow users this many days to set up MFA before enforcing
            </p>
          </div>

          <div className="pt-4">
            <Button>Save MFA Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recovery Options</CardTitle>
          <CardDescription>
            Configure account recovery methods when MFA is lost
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recovery Codes</Label>
              <p className="text-xs text-muted-foreground">
                Allow users to generate backup recovery codes
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery-codes">Number of Recovery Codes</Label>
            <Input id="recovery-codes" type="number" defaultValue="10" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Admin MFA Reset</Label>
              <p className="text-xs text-muted-foreground">Allow admins to reset MFA for users</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="pt-4">
            <Button>Save Recovery Settings</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
