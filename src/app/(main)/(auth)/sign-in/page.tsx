import SignInForm from "@/components/modules/auth/sign-in-form";
import { ROUTE_PATHS } from "@/lib/constants";
import Link from "next/link";

export default function SignUpPage() {
	return (
		<div className="min-w-[400px] max-w-450px">
			<h3 className="mt-7 text-2xl font-semibold">Sign Up</h3>
			<p className="mt-1">
				{"Don't"} have an account?{" "}
				<Link className="underline" href={ROUTE_PATHS.SIGN_UP}>
					Sign Up
				</Link>
			</p>

			<SignInForm />
		</div>
	);
}
