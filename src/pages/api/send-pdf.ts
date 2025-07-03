import { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument } from "pdf-lib";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
async function clearUploadFolder(folderPath: string) {
  try {
    await fs.access(folderPath);
    const files = await fs.readdir(folderPath);
    await Promise.all(
      files.map((file) => fs.unlink(path.join(folderPath, file)))
    );
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      // Folder doesn't exist; create it
      await fs.mkdir(folderPath, { recursive: true });
    } else {
      throw err;
    }
  }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { images } = req.body;
  if (!Array.isArray(images))
    return res.status(400).json({ error: "Invalid input" });

  try {
    // 1. Clear upload folder
    const uploadDir = path.join(process.cwd(), "public", "pdfs");
    await clearUploadFolder(uploadDir);

    // 2. Create PDF from images
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

    // 3. Save PDF file to public folder
    const fileName = `doc-scan-pdf-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pdfs/${fileName}`;

    await fs.writeFile(filePath, pdfBytes);

    // 4. Send email with link
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
      html: `<p>Your PDF is ready. <a href="${publicUrl}" target="_blank">Click here to download</a>.</p>`,
    });

    return res.status(200).json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("Error sending PDF:", err);
    return res.status(500).json({ error: "Server Error" });
  }
}
