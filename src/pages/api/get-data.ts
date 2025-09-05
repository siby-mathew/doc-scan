import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../lib/aithAuth";
import { getJsonData } from "@utils/getJsonData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return withAuth(req, res, async (user) => {
    const data = await getJsonData();
    res.status(200).json({
      message: "Ping",
      user,
      data,
    });
  });
}
