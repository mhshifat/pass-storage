export async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await res.json();

  if (!json.access_token) {
    throw new Error("Unable to refresh access token");
  }

  return json.access_token;
}

export async function getSheetNames(refreshToken: string): Promise<{ id: string, name: string }[]> {
  const accessToken = await getAccessToken(refreshToken);

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const json = await res.json();

  return json.files;
}

export async function getSheetTabs(refreshToken: string, spreadsheetId: string): Promise<{ properties: { title: string } }[]> {
  const accessToken = await getAccessToken(refreshToken);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  if (!data.sheets) return [];

  return data.sheets;
}

export async function getSheetData(
  refreshToken: string,
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const accessToken = await getAccessToken(refreshToken);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetName
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  return data.values || [];
}
