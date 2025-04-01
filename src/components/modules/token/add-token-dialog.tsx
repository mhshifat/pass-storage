"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TOTPToken } from "@/lib/types";
import { parseOTPAuthURI } from "@/lib/totp";
import {
	Plus,
	AlertCircle,
	Info,
	KeyRound,
	Globe,
	User,
	Lock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/components/hooks/use-mobile";
import { toast } from "@/lib/toast";
import { PasswordGenerator } from "@/components/shared/password-generator";
import useAddTokenMutation from "@/components/hooks/use-add-token-mutation";
import { PasswordInput } from "@/components/ui/password-input";

export function AddTokenDialog() {
  const addToken = useAddTokenMutation();

	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState("manual");
	const isMobile = useIsMobile();

	const [name, setName] = useState("");
	const [issuer, setIssuer] = useState("");
	const [secret, setSecret] = useState("");
	const [qrCode, setQrCode] = useState("");
	const [qrCodeError, setQrCodeError] = useState("");

	const [serviceUrl, setServiceUrl] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);

	const resetForm = () => {
		setName("");
		setIssuer("");
		setSecret("");
		setQrCode("");
		setQrCodeError("");
		setServiceUrl("");
		setUsername("");
		setPassword("");
		setShowPasswordGenerator(false);
		setTab("manual");
	};

	const handleClose = () => {
		setOpen(false);
		resetForm();
	};

	const validateManualForm = () => {
		if (!name) {
			toast.error("Please provide a token name");
			return false;
		}

		if (!secret) {
			toast.error("Please provide a secret key");
			return false;
		}

		if (!serviceUrl) {
			toast.error("Please provide a service url");
			return false;
		}

		if (!username) {
			toast.error("Please provide a username");
			return false;
		}

		if (!password) {
			toast.error("Please provide a password");
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (tab === "manual") {
			if (!validateManualForm()) return;

			const newToken: Omit<TOTPToken, "id" | "createdAt"> = {
				name,
				issuer: issuer || "Unknown",
				secret: secret.replace(/\s/g, "").toUpperCase(),
				algorithm: "SHA1",
				digits: 6,
				period: 30,
				serviceUrl,
				username,
				password,
			};

			await addToken.mutateAsync(newToken);
			toast.success(`${name} has been added successfully`);
		} else if (tab === "uri") {
			if (!qrCode) {
				setQrCodeError("Please enter a URI");
				return;
			}

			const parsedToken = parseOTPAuthURI(qrCode);
			if (!parsedToken || !parsedToken.secret) {
				setQrCodeError(
					"Invalid OTP Auth URI format. It should start with 'otpauth://'"
				);
				return;
			}

      if (!serviceUrl) {
        toast.error("Please provide a service url");
        return;
      }
      if (!username) {
        toast.error("Please provide a username");
        return;
      }
      if (!password) {
        toast.error("Please provide a password");
        return;
      }

			const newToken: Omit<TOTPToken, "id" | "createdAt"> = {
				name: parsedToken.name || "Unknown",
				issuer: parsedToken.issuer || "Unknown",
				secret: parsedToken.secret,
				algorithm: parsedToken.algorithm || "SHA1",
				digits: parsedToken.digits || 6,
				period: parsedToken.period || 30,
				serviceUrl,
				username,
				password,
			};
			await addToken.mutateAsync(newToken);

			toast.success(`${newToken.name} has been added successfully`);
		}

		handleClose();
	};

	const handleQRCodeChange = (value: string) => {
		setQrCode(value);
		if (qrCodeError) setQrCodeError("");
	};

	const handleGeneratedPassword = (generatedPassword: string) => {
		setPassword(generatedPassword);
	};

	const DialogComponent = isMobile ? Drawer : Dialog;
	const DialogTriggerComponent = isMobile ? DrawerTrigger : DialogTrigger;
	const DialogContentComponent = isMobile ? DrawerContent : DialogContent;
	const DialogHeaderComponent = isMobile ? DrawerHeader : DialogHeader;
	const DialogFooterComponent = isMobile ? DrawerFooter : DialogFooter;
	const DialogTitleComponent = isMobile ? DrawerTitle : DialogTitle;
	const DialogDescriptionComponent = isMobile
		? DrawerDescription
		: DialogDescription;
	const DialogCloseComponent = isMobile ? DrawerClose : "button";

	const renderCredentialsFields = () => (
		<div className="space-y-4 mt-4 border-t pt-4">
			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="service-url" className="flex items-center gap-1">
						<Globe className="h-3.5 w-3.5" />
						Service URL*
					</Label>
					<Input
						id="service-url"
						value={serviceUrl}
						onChange={(e) => setServiceUrl(e.target.value)}
						placeholder="https://example.com"
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="username" className="flex items-center gap-1">
						<User className="h-3.5 w-3.5" />
						Username*
					</Label>
					<Input
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="your_username"
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="password" className="flex items-center gap-1">
						<Lock className="h-3.5 w-3.5" />
						Password*
					</Label>
					<div className="flex gap-2">
						<PasswordInput
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
						/>
						<Button
							type="button"
							variant="outline"
							onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
							className="whitespace-nowrap"
						>
							<KeyRound className="h-4 w-4 mr-2" />
							{showPasswordGenerator ? "Hide Generator" : "Generate"}
						</Button>
					</div>
					{showPasswordGenerator && (
						<div className="mt-2 p-3 border rounded-md bg-background">
							<PasswordGenerator
								onPasswordGenerated={handleGeneratedPassword}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);

	return (
		<DialogComponent open={open} onOpenChange={setOpen}>
			<DialogTriggerComponent disabled={addToken.isPending} asChild>
				<Button variant="outline">
					<Plus className="h-4 w-4 mr-2" />
					Add Token
				</Button>
			</DialogTriggerComponent>
			<DialogContentComponent className={isMobile ? "" : "sm:max-w-[425px]"}>
				<DialogHeaderComponent>
					<DialogTitleComponent>Add New Token</DialogTitleComponent>
					<DialogDescriptionComponent>
						Add a new token for generating TOTP codes.
					</DialogDescriptionComponent>

					<DialogCloseComponent disabled={addToken.isPending} />
				</DialogHeaderComponent>
				<Tabs value={tab} onValueChange={setTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger disabled={addToken.isPending} value="manual">Manual Entry</TabsTrigger>
						<TabsTrigger disabled={addToken.isPending} value="uri">QR Code URI</TabsTrigger>
					</TabsList>

					<TabsContent value="manual" className="space-y-4 mt-4">
						<form id="manual-form" onSubmit={handleSubmit}>
							<div className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Token Name*</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="e.g. Work Email"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="issuer">Service/Issuer</Label>
									<Input
										id="issuer"
										value={issuer}
										onChange={(e) => setIssuer(e.target.value)}
										placeholder="e.g. Google, GitHub, etc."
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="secret">Secret Key*</Label>
									<Input
										id="secret"
										value={secret}
										onChange={(e) => setSecret(e.target.value)}
										placeholder="e.g. JBSWY3DPEHPK3PXP"
										required
									/>
									<p className="text-xs text-muted-foreground">
										This is the secret key provided by the service, usually
										shown during 2FA setup.
									</p>
								</div>

								<div className="bg-muted p-3 rounded-md">
									<div className="flex items-start gap-2">
										<Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
										<div>
											<h4 className="text-sm font-medium mb-1">
												Where to find the Secret Key:
											</h4>
											<ol className="text-xs text-muted-foreground list-decimal pl-5 space-y-1">
												<li>
													During 2FA setup, look for{" "}
													{`"manual setup" or "can't scan QR code"`} option
												</li>
												<li>
													The service will show a text code (
													{`often called "secret key"`})
												</li>
												<li>
													The key usually looks like a string of letters and
													numbers (e.g., JBSWY3DPEHPK3PXP)
												</li>
												<li>
													Enter that key here exactly as shown (spaces are
													automatically removed)
												</li>
											</ol>
										</div>
									</div>
								</div>

								{renderCredentialsFields()}
							</div>
						</form>
					</TabsContent>

					<TabsContent value="uri" className="space-y-4 mt-4">
						<form id="uri-form" onSubmit={handleSubmit}>
							<div className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="uri">OTPAuth URI</Label>
									<Input
										id="uri"
										value={qrCode}
										onChange={(e) => handleQRCodeChange(e.target.value)}
										placeholder="otpauth://totp/..."
										required
									/>
									<p className="text-xs text-muted-foreground">
										Paste the URI from the QR code, starting with{" "}
										{`"otpauth://".`}
									</p>
								</div>

								{qrCodeError && (
									<Alert variant="destructive" className="mt-2">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{qrCodeError}</AlertDescription>
									</Alert>
								)}

								<div className="bg-muted p-3 rounded-md">
									<h4 className="text-sm font-medium mb-2">
										How to find the URI:
									</h4>
									<ol className="text-xs text-muted-foreground list-decimal pl-5 space-y-1">
										<li>Scan the QR code with your {"phone's"} camera</li>
										<li>View the URL that appears</li>
										<li>Copy the entire URL starting with {`"otpauth://"`}</li>
										<li>Paste it here</li>
									</ol>
								</div>

								{renderCredentialsFields()}
							</div>
						</form>
					</TabsContent>
				</Tabs>
				<DialogFooterComponent>
					{isMobile ? (
						<DrawerClose asChild>
							<Button disabled={addToken.isPending} variant="outline" className="w-full">
								Cancel
							</Button>
						</DrawerClose>
					) : (
						<Button disabled={addToken.isPending} variant="outline" onClick={handleClose}>
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						form={tab === "manual" ? "manual-form" : "uri-form"}
            disabled={addToken.isPending}
            loading={addToken.isPending}
					>
						Add Token
					</Button>
				</DialogFooterComponent>
			</DialogContentComponent>
		</DialogComponent>
	);
}
