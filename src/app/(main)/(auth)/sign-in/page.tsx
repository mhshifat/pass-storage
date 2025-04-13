import SignInForm from "@/components/modules/auth/sign-in-form";
import Translate from "@/components/shared/translate";
import { ROUTE_PATHS } from "@/lib/constants";
import Link from "next/link";

export default function SignUpPage() {
	return (
		<div className="min-w-[400px] max-w-450px">
			<Translate as="h3" className="mt-7 text-2xl font-semibold">Sign In</Translate>
			<p className="mt-1">
				<Translate>{"Don't have an account?"}</Translate>{" "}
				<Link className="underline" href={ROUTE_PATHS.SIGN_UP}>
          <Translate>Sign Up</Translate>
				</Link>
			</p>

			<SignInForm />
		</div>
	);
}
