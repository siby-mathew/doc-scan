import { PrivyClient } from "@privy-io/server-auth";
import { NextApiRequest, NextApiResponse } from "next";

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function withAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (
    user: any,
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void>
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const verified = await privy.verifyAuthToken(token);

    const fullUser = await privy.getUser(verified.userId);

    return handler(fullUser, req, res);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
