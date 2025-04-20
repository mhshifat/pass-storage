import { toast } from "@/lib/toast";
import { useTranslation } from "react-i18next";

export default function useCopyToClipboard() {
  const { t } = useTranslation()

  const handleCopyInviteLink = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success(t("Copied to clipboard"));
  };

  return handleCopyInviteLink
}
