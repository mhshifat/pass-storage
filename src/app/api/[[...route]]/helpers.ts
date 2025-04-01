import { userService } from "./bootstrap";

export async function getUserById(id: string) {
  const data = await userService.findById(id, ["credential"]);
  if (!data || !data?.credential) return null;
  return {
    id: data.id,
    email: data.credential.email,
    password: data.credential.password,
  }
}
