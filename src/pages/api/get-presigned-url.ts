import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { s3 } from "../../lib/s3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const fileName = `scan-${Date.now()}-${randomUUID()}.pdf`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileName,
    ContentType: "application/pdf",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  res.status(200).json({ uploadUrl, fileUrl });
}
