import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
        return NextResponse.json({ error: "No code" }, { status: 400 });
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
            grant_type: "authorization_code"
        })
    });

    const tokens = await tokenRes.json();

    const { refresh_token } = tokens;

    if (!refresh_token) {
        throw new Error(`Google did not return a refresh token.\n ${JSON.stringify(tokens, null, 4)}`);
    }

    let connectionId: number | null = null;

    if (state) {
        try {
            const parsedData = JSON.parse(state);
            connectionId = parsedData?.connectionId;
        } catch (err) {
            throw new Error(`Failed to parse state data\n ${err}`);
        }
    }

    if (!connectionId) throw new Error("Connection id is missing");

    await prisma.connection.update({
        where: {
            id: connectionId
        },
        data: {
            metadata: tokens,
        }
    });

    const baseUrl = req.url;
    const url = new URL("/admin/connections", baseUrl);

    return NextResponse.redirect(url.toString());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
