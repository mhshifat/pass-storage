import SignUpForm from "@/components/modules/auth/sign-up-form";
import Translate from "@/components/shared/translate";
import { ROUTE_PATHS } from "@/lib/constants";
import Link from "next/link";

export default function SignUpPage() {
	return (
		<div className="min-w-[400px] max-w-450px">
			<Translate as="h3" className="mt-7 text-2xl font-semibold">Sign Up</Translate>
			<p className="mt-1">
				<Translate>Already have an account?</Translate>{" "}
				<Link className="underline" href={ROUTE_PATHS.SIGN_IN}>
          <Translate>Sign In</Translate>
				</Link>
			</p>

			<SignUpForm />
		</div>
	);
}
