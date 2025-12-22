import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    if (session?.isLoggedIn === true) {
        return redirect("/admin");
    }

    return (
        <div>
            {children}
        </div>
    );
}