import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

interface PasswordGeneratorProps {
	onPasswordGenerated: (password: string) => void;
}

export function PasswordGenerator({
	onPasswordGenerated,
}: PasswordGeneratorProps) {
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
			toast.error("Please select at least one character type");
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
		toast.success("Password copied to clipboard");
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Input
					value={password}
					readOnly
					placeholder="Generated password"
					className="font-mono"
				/>
				<Button
					variant="outline"
					size="icon"
					onClick={copyPassword}
					title="Copy password"
				>
					<Copy className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={generatePassword}
					title="Generate new password"
				>
					<RefreshCw className="h-4 w-4" />
				</Button>
			</div>

			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<Label>Password length: {length}</Label>
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
					<Label htmlFor="lowercase">Lowercase (a-z)</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="uppercase"
						checked={includeUppercase}
						onCheckedChange={setIncludeUppercase}
					/>
					<Label htmlFor="uppercase">Uppercase (A-Z)</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="numbers"
						checked={includeNumbers}
						onCheckedChange={setIncludeNumbers}
					/>
					<Label htmlFor="numbers">Numbers (0-9)</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="symbols"
						checked={includeSymbols}
						onCheckedChange={setIncludeSymbols}
					/>
					<Label htmlFor="symbols">Symbols (!@#$...)</Label>
				</div>
			</div>

			<Button onClick={generatePassword} className="w-full">
				Generate Password
			</Button>
		</div>
	);
}
