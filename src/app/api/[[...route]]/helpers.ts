import { VaultKeyDto } from "@/lib/types";
import { userService } from "./bootstrap";

export async function getUserById(id: string) {
  const data = await userService.findById(id, ["credential", "teams"]);
  if (!data || !data?.credential) return null;
  return {
    id: data.id,
    email: data.email,
    password: data.credential.password,
    salt: data.credential.salt,
    vault_key_iv: data.credential.vault_key_iv,
    encrypted_vault_key: data.credential.encrypted_vault_key,
    vault_keys: [...data.members.map(m => (m as unknown as { teams: { team: { vault_keys: [] } }[] }).teams?.map(t => t.team?.vault_keys).flat()).flat(), ...data.organizations.map(org => (org as unknown as { teams: { vault_keys: VaultKeyDto[] }[] }).teams.map(t => t?.vault_keys).flat()).flat()].filter(Boolean),
    teams: [
      ...data.members.map(m => (m as unknown as { teams: { team: { id: string } }[] }).teams?.map(t => ({ id: t.team.id })).flat()).flat(),
      ...data.organizations.map(org => (org as unknown as { teams: { id: string }[] }).teams.map(t => ({ id: t?.id })).flat()).flat()
    ].filter(Boolean)
  }
}
