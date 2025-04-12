import { userService } from "./bootstrap";

export async function getUserById(id: string) {
  const data = await userService.findById(id, ["credential", "teams"]);
  if (!data || !data?.credential) return null;
  return {
    id: data.id,
    email: data.credential.email,
    password: data.credential.password,
    teams: data.members.map((m) => (m as unknown as { teams: { team_id: string }[] }).teams?.map(t => ({ id: t.team_id }))).flat()
  }
}
