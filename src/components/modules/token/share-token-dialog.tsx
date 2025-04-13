import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IToken } from "@/lib/types";
import useShareTokenMutation from "@/components/hooks/use-share-token-mutation";
import useGetOrganizationsWithTeamsQuery from "@/components/hooks/use-get-organizations-with-teams-query";
import { Share2Icon } from "lucide-react";
import { toast } from "@/lib/toast";
import { useTranslation } from "react-i18next";
import Translate from "@/components/shared/translate";

interface ShareTokenDialogProps {
  token: IToken;
}

export function ShareTokenDialog({ token }: ShareTokenDialogProps) {
  const { t } = useTranslation();
  const shareToken = useShareTokenMutation();
  const { data: organizationsWithTeams } = useGetOrganizationsWithTeamsQuery({
    params: {
      page: "1",
      teams: "true"
    }
  });
  const [open, setOpen] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return toast.error("Please select a team");
    await shareToken.mutateAsync({
      id: token.id,
      teamId
    });
    setTeamId(null);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8"
        title={t("Share collection")}
        disabled={shareToken.isPending}
      >
        <Share2Icon size={16} />
      </Button>
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle><Translate>Share Token</Translate></DialogTitle>
            <DialogDescription>
              <Translate>Share this token to a team.</Translate>
            </DialogDescription>
          </DialogHeader>
          <form id="edit-form" onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-period"><Translate>Team</Translate></Label>
                  <Select value={teamId || ""} onValueChange={setTeamId}>
                    <SelectTrigger id="edit-period" className="w-full">
                      <SelectValue placeholder={t("Select Team")} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationsWithTeams?.data?.map(item => item.teams).flat().map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button disabled={shareToken.isPending} variant="outline" onClick={() => setOpen(false)}>
              <Translate>Cancel</Translate>
            </Button>
            <Button disabled={shareToken.isPending} loading={shareToken.isPending} type="submit" form="edit-form">
              <Translate>Share</Translate>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
