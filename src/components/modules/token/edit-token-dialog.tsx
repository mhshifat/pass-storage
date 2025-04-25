import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ITokenFormPayload } from "@/lib/types";
import { Eye, EyeOff, Globe, User, Lock, EditIcon } from "lucide-react";
import useUpdateTokenMutation from "@/components/hooks/use-update-token-mutation";
import { useTranslation } from "react-i18next";
import Translate from "@/components/shared/translate";
import { useAuth } from "@/components/providers/auth";
import { encryptEntry } from "@/lib/encryption";

interface EditTokenDialogProps {
  token: ITokenFormPayload;
}

export function EditTokenDialog({ token }: EditTokenDialogProps) {
  const { t } = useTranslation();
  const { vaultKey } = useAuth();
  const updateToken = useUpdateTokenMutation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(token.name);
  const [issuer, setIssuer] = useState(token.issuer);
  const [period, setPeriod] = useState(token.period.toString());
  const [digits, setDigits] = useState(token.digits.toString());
  const [algorithm, setAlgorithm] = useState(token.algorithm);
  const [serviceUrl, setServiceUrl] = useState(token.serviceUrl || "");
  const [username, setUsername] = useState(token.username || "");
  const [password, setPassword] = useState(token.password || "");
  const [showPassword, setShowPassword] = useState(false);

  // Update form when token changes
  useEffect(() => {
    setName(token.name);
    setIssuer(token.issuer);
    setPeriod(token.period.toString());
    setDigits(token.digits.toString());
    setAlgorithm(token.algorithm);
    setServiceUrl(token.serviceUrl || "");
    setUsername(token.username || "");
    setPassword(token.password || "");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newToken = {
      ...token,
      name,
      issuer,
      period: parseInt(period, 10),
      digits: parseInt(digits, 10),
      algorithm: algorithm as string,
      serviceUrl: serviceUrl || undefined,
      username: username || undefined,
      password: password || undefined,
    }

    const encryptedToken = encryptEntry(JSON.stringify(newToken), vaultKey!);

    await updateToken.mutateAsync({
      id: token.id,
      entry: encryptedToken.encryptedEntry,
      iv: encryptedToken.iv,
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8"
        title={t("Edit collection")}
        disabled={updateToken.isPending}
      >
        <EditIcon size={16} />
      </Button>
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle><Translate>Edit Account</Translate></DialogTitle>
            <DialogDescription>
              <Translate>Update the details for this account.</Translate>
            </DialogDescription>
          </DialogHeader>
          <form id="edit-form" onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name"><Translate>Account Name</Translate></Label>
                <Input 
                  id="edit-name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-issuer"><Translate>Service/Issuer</Translate></Label>
                <Input 
                  id="edit-issuer" 
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-period"><Translate>Period (seconds)</Translate></Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger id="edit-period">
                      <SelectValue placeholder={t("Period")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30"><Translate>30</Translate></SelectItem>
                      <SelectItem value="60"><Translate>60</Translate></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-digits"><Translate>Digits</Translate></Label>
                  <Select value={digits} onValueChange={setDigits}>
                    <SelectTrigger id="edit-digits">
                      <SelectValue placeholder={t("Digits")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6"><Translate>6</Translate></SelectItem>
                      <SelectItem value="8"><Translate>8</Translate></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-algorithm"><Translate>Algorithm</Translate></Label>
                <Select value={algorithm} onValueChange={setAlgorithm as (value: string) => void}>
                  <SelectTrigger id="edit-algorithm">
                    <SelectValue placeholder={t("Algorithm")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHA1"><Translate>SHA1</Translate></SelectItem>
                    <SelectItem value="SHA256"><Translate>SHA256</Translate></SelectItem>
                    <SelectItem value="SHA512"><Translate>SHA512</Translate></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-3"><Translate>Account Credentials</Translate></h3>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-service-url" className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      <Translate>Service URL</Translate>
                    </Label>
                    <Input 
                      id="edit-service-url" 
                      value={serviceUrl}
                      onChange={(e) => setServiceUrl(e.target.value)}
                      placeholder="https://example.com" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-username" className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <Translate>Username</Translate>
                    </Label>
                    <Input 
                      id="edit-username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t("Your username")} 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-password" className="flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      <Translate>Password</Translate>
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        id="edit-password" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button disabled={updateToken.isPending} variant="outline" onClick={() => setOpen(false)}>
              <Translate>Cancel</Translate>
            </Button>
            <Button disabled={updateToken.isPending} loading={updateToken.isPending} type="submit" form="edit-form">
              <Translate>Save Changes</Translate>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
