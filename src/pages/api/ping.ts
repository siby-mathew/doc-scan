import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../lib/aithAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return withAuth(req, res, async (user) => {
    res.status(200).json({
      message: "Ping",
      user,
    });
  });
}
