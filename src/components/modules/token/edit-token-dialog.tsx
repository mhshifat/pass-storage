import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IToken } from "@/lib/types";
import { Eye, EyeOff, Globe, User, Lock, EditIcon } from "lucide-react";
import useUpdateTokenMutation from "@/components/hooks/use-update-token-mutation";

interface EditTokenDialogProps {
  token: IToken;
}

export function EditTokenDialog({ token }: EditTokenDialogProps) {
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
    await updateToken.mutateAsync({
      id: token.id,
      name,
      issuer,
      period: parseInt(period, 10),
      digits: parseInt(digits, 10),
      algorithm: algorithm as string,
      serviceUrl: serviceUrl || undefined,
      username: username || undefined,
      password: password || undefined,
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
        title="Edit collection"
        disabled={updateToken.isPending}
      >
        <EditIcon size={16} />
      </Button>
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update the details for this account.
            </DialogDescription>
          </DialogHeader>
          <form id="edit-form" onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Account Name</Label>
                <Input 
                  id="edit-name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-issuer">Service/Issuer</Label>
                <Input 
                  id="edit-issuer" 
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-period">Period (seconds)</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger id="edit-period">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-digits">Digits</Label>
                  <Select value={digits} onValueChange={setDigits}>
                    <SelectTrigger id="edit-digits">
                      <SelectValue placeholder="Digits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-algorithm">Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm as (value: string) => void}>
                  <SelectTrigger id="edit-algorithm">
                    <SelectValue placeholder="Algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHA1">SHA1</SelectItem>
                    <SelectItem value="SHA256">SHA256</SelectItem>
                    <SelectItem value="SHA512">SHA512</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-3">Account Credentials</h3>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-service-url" className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      Service URL
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
                      Username
                    </Label>
                    <Input 
                      id="edit-username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_username" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-password" className="flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Password
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
              Cancel
            </Button>
            <Button disabled={updateToken.isPending} loading={updateToken.isPending} type="submit" form="edit-form">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
