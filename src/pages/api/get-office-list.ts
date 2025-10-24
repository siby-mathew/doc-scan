import { getOffices } from "../../utils/getOffices";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const offices = getOffices().map((item) => {
    return { name: item.name };
  });
  res.status(200).json({ offices });
}
