import { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument } from "pdf-lib";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { images } = req.body;
  if (!Array.isArray(images))
    return res.status(400).json({ error: "Invalid input" });

  try {
    // Create PDF
    const pdfDoc = await PDFDocument.create();

    for (const img of images) {
      const imageBytes = Buffer.from(img.split(",")[1], "base64");

      const page = pdfDoc.addPage();
      let embed, dims;

      if (img.startsWith("data:image/png")) {
        embed = await pdfDoc.embedPng(imageBytes);
        dims = embed.scale(0.5);
      } else {
        embed = await pdfDoc.embedJpg(imageBytes);
        dims = embed.scale(0.5);
      }

      page.setSize(dims.width, dims.height);
      page.drawImage(embed, {
        x: 0,
        y: 0,
        width: dims.width,
        height: dims.height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use SMTP provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "sibym.ui@gmail.com,savadmv333@gmail.com",
      subject: "Your PDF is ready",
      text: "See attached PDF.",
      attachments: [
        {
          filename: `${new Date().getTime()}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
  }
}
