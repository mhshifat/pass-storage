import { toast } from "@/lib/toast";

export default function useCopyToClipboard() {
  const handleCopyInviteLink = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Copied to clipboard");
  };

  return handleCopyInviteLink
}
