import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { v4 as uuidv4 } from "uuid";

import { getOffices } from "../../utils/getOffices";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, name, phone, address, office } = req.body;
  if (!name || !phone || !address || !office) {
    return res.status(405).json({ error: "Some fields are missing" });
  }

  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

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

    const newEntry = {
      id: uuidv4(),
      name,
      phone,
      office,
      doc: url,
      time: new Date().getTime(),
      address,
    };
    data.push(newEntry);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: "application/json",
      })
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const _office = getOffices().find(
      (item) => item.name?.toLowerCase() === office?.toLowerCase()
    );

    if (_office && _office.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: _office.email,
        subject: `${office}`,
        html: `<p>Document received,thank you</p>`,
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.TARGET_EMAILS,
      subject: `${name} | ${address}`,
      html: `<p>
      <p><b>Name</b>  : ${name}</p>\n
      <p><b>Phone</b>  :${phone}</p>\n
       <p><b>Office</b>  :${office}</p>\n
      <p><b>Address</b>  :${address.replace(/\n/g, "<br>")}</p>\n
      Your scanned PDF is ready: <a href="${url}" target="_blank">Download PDF</a></p>`,
    });

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({
      error: "Email send failed",
      env: process.env.EMAIL_USER,
      p: process.env.EMAIL_PASS,
    });
  }
}

function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}
