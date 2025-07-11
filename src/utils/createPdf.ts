import { PageSizes, PDFDocument } from "pdf-lib";

export const createPdf = async (
  images: string[],
  callback?: (status: boolean) => void
) => {
  try {
    const pdfDoc = await PDFDocument.create();
    // const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    for (const base64 of images) {
      const imageBytes = Uint8Array.from(atob(base64.split(",")[1]), (c) =>
        c.charCodeAt(0)
      );

      let embed;
      if (base64.startsWith("data:image/png")) {
        embed = await pdfDoc.embedPng(imageBytes);
      } else {
        embed = await pdfDoc.embedJpg(imageBytes);
      }

      const [A4_WIDTH, A4_HEIGHT] = PageSizes.A4;

      const { width: imgWidth, height: imgHeight } = embed.size();

      const scale = Math.min(A4_WIDTH / imgWidth, A4_HEIGHT / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      const x = (A4_WIDTH - scaledWidth) / 2;
      const y = (A4_HEIGHT - scaledHeight) / 2;

      const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      page.drawImage(embed, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
      //   const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      //   page.drawText(`Captured on: ${timestamp}`, {
      //     x: A4_WIDTH - 200,
      //     y: 20,
      //     size: 12,
      //     font: helveticaFont,
      //     color: rgb(0, 0, 0),
      //   });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdfFile = new File([pdfBlob], `scan-${Date.now()}.pdf`, {
      type: "application/pdf",
    });

    const presigned = await fetch("/api/get-presigned-url");
    const { uploadUrl, fileUrl } = await presigned.json();

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: pdfFile,
    });

    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: fileUrl }),
    });
    if (callback && typeof callback === "function") {
      callback(!0);
    }
    alert("Attachment sent");
  } catch (e) {
    if (callback && typeof callback === "function") {
      callback(!1);
    }
    alert(e && e instanceof Error ? e.message : "Failed to send email");
  }
};
