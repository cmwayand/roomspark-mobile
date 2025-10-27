import { NextRequest } from "next/server";

export function decodeJWT(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload;
  } catch (error) {
    throw new Error("Failed to decode JWT");
  }
}

export function getUserIdFromRequest(request: NextRequest): string {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No Authorization header or invalid format");
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = decodeJWT(token);

  if (!payload.iss || !payload.iss.includes("clerk")) {
    throw new Error("Not a Clerk token");
  }

  if (!payload.sub) {
    throw new Error("No user ID in token");
  }

  return payload.sub;
}
