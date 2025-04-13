import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import { useTranslation } from "react-i18next";
import Translate from "./translate";

interface PasswordGeneratorProps {
	onPasswordGenerated: (password: string) => void;
}

export function PasswordGenerator({
	onPasswordGenerated,
}: PasswordGeneratorProps) {
  const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [length, setLength] = useState(16);
	const [includeUppercase, setIncludeUppercase] = useState(true);
	const [includeLowercase, setIncludeLowercase] = useState(true);
	const [includeNumbers, setIncludeNumbers] = useState(true);
	const [includeSymbols, setIncludeSymbols] = useState(true);

	const generatePassword = () => {
		let charset = "";
		if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
		if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		if (includeNumbers) charset += "0123456789";
		if (includeSymbols) charset += "!@#$%^&*()_-+=[]{}|;:,.<>?";

		if (charset === "") {
			toast.error(t("Please select at least one character type"));
			return;
		}

		let generatedPassword = "";
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			generatedPassword += charset[randomIndex];
		}

		setPassword(generatedPassword);
		onPasswordGenerated(generatedPassword);
	};

	const copyPassword = () => {
		if (!password) return;

		navigator.clipboard.writeText(password);
		toast.success(t("Password copied to clipboard"));
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Input
					value={password}
					readOnly
					placeholder={t("Generated password")}
					className="font-mono"
				/>
				<Button
					variant="outline"
					size="icon"
					onClick={copyPassword}
					title={t("Copy password")}
				>
					<Copy className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={generatePassword}
					title={t("Generate new password")}
				>
					<RefreshCw className="h-4 w-4" />
				</Button>
			</div>

			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<Label><Translate>Password length</Translate>: {t(length + "")}</Label>
				</div>
				<Slider
					value={[length]}
					min={8}
					max={32}
					step={1}
					onValueChange={(value) => setLength(value[0])}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="flex items-center space-x-2">
					<Switch
						id="lowercase"
						checked={includeLowercase}
						onCheckedChange={setIncludeLowercase}
					/>
					<Label htmlFor="lowercase"><Translate>Lowercase (a-z)</Translate></Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="uppercase"
						checked={includeUppercase}
						onCheckedChange={setIncludeUppercase}
					/>
					<Label htmlFor="uppercase"><Translate>Uppercase (A-Z)</Translate></Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="numbers"
						checked={includeNumbers}
						onCheckedChange={setIncludeNumbers}
					/>
					<Label htmlFor="numbers"><Translate>Numbers (0-9)</Translate></Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="symbols"
						checked={includeSymbols}
						onCheckedChange={setIncludeSymbols}
					/>
					<Label htmlFor="symbols"><Translate>Symbols</Translate> (!@#$...)</Label>
				</div>
			</div>

			<Button onClick={generatePassword} className="w-full">
				<Translate>Generate Password</Translate>
			</Button>
		</div>
	);
}
