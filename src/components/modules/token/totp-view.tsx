import useCopyToClipboard from "@/components/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { generateTOTP } from "@/lib/totp";
import { ITokenFormPayload } from "@/lib/types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface TOTPViewProps {
	token: ITokenFormPayload;
}

export default function TOTPView({ token }: TOTPViewProps) {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
	const [code, setCode] = useState("");
	const [progress, setProgress] = useState(100);
	const [secondsRemaining, setSecondsRemaining] = useState(30);

  const formattedCode = code.match(/.{1,3}/g)?.join(" ") || code;

	useEffect(() => {
		let intervalId: number;

		const updateCode = async () => {
			try {
				const result = await generateTOTP(
					token.secret,
					token.period,
					token.digits,
					token.algorithm as "SHA1" | "SHA256" | "SHA512"
				);

				setCode(result.token);
				setSecondsRemaining(result.secondsRemaining);
				setProgress(result.progress);
			} catch (error) {
				console.error("Error generating TOTP:", error);
			}
		};

		updateCode();
		// eslint-disable-next-line prefer-const
		intervalId = window.setInterval(updateCode, 1000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [token]);

	return (
		<div className="flex items-center gap-2">
			<Button title={t("translations.refreshing_in", {
        seconds: secondsRemaining,
        progress: Math.round(progress),
      })} variant="ghost" onClick={() => copyToClipboard(code)} className="p-0 justify-start">{formattedCode?.split("").map(() => "*").join("")}</Button>
		</div>
	);
}
