import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../lib/s3";

export const getJsonData = async () => {
  const bucketName = process.env.AWS_S3_BUCKET!;
  const key = "data.json";
  let data: any[] = [];
  try {
    const existing = await s3.send(
      new GetObjectCommand({ Bucket: bucketName, Key: key })
    );
    const body = await streamToString(existing.Body as any);
    data = JSON.parse(body);
  } catch {
    data = [];
  }
  return data;
};

export const streamToString = (stream: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};
