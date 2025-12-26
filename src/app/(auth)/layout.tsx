import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
    try {
        const session = await getSession();

        if (session?.isLoggedIn === true) {
            return redirect("/admin");
        }
    } catch (error) {
        // If session check fails (e.g., database timeout), 
        // allow the page to render anyway (graceful degradation)
        // The user can still attempt to login
        console.error("Session check failed in auth layout:", error);
    }

    return (
        <div>
            {children}
        </div>
    );
}