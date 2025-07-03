import { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument } from "pdf-lib";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2024mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { images } = req.body;
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // 1. Create PDF
    const pdfDoc = await PDFDocument.create();

    for (const img of images) {
      const imageBytes = Buffer.from(img.split(",")[1], "base64");
      const page = pdfDoc.addPage();
      let embed;

      if (img.startsWith("data:image/png")) {
        embed = await pdfDoc.embedPng(imageBytes);
      } else {
        embed = await pdfDoc.embedJpg(imageBytes);
      }

      const dims = embed.scale(0.5);
      page.setSize(dims.width, dims.height);
      page.drawImage(embed, {
        x: 0,
        y: 0,
        width: dims.width,
        height: dims.height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    // 2. Upload to S3
    const fileName = `doc-scan-${Date.now()}-${randomUUID()}.pdf`;

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      Body: Buffer.from(pdfBytes),
      ContentType: "application/pdf",
      ACL: "public-read", // Make public if you want to link directly
    });

    await s3.send(uploadCommand);

    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // 3. Send Email with link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "sibym.ui@gmail.com",
      subject: "Your PDF is ready",
      html: `<p>Your PDF is ready. <a href="${s3Url}" target="_blank">Click here to download</a>.</p>`,
    });

    return res.status(200).json({ success: true, url: s3Url });
  } catch (err) {
    console.error("Error uploading PDF to S3 and sending email:", err);
    return res.status(500).json({ error: "Server Error" });
  }
}
