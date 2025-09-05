import { PageSizes, PDFDocument } from "pdf-lib";
import api from "../lib/axios";

type FormType = {
  phone: string;
  name: string;
  address: string;
};

export const createPdf = async (
  { images, meta }: { images: string[]; meta: FormType },
  callback?: (status: boolean) => void
) => {
  const onComplete = (status: boolean) => {
    if (callback && typeof callback === "function") {
      callback(status);
    }
  };

  try {
    const pdfDoc = await PDFDocument.create();

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
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes as any], { type: "application/pdf" });
    const pdfFile = new File([pdfBlob], `scan-${Date.now()}.pdf`, {
      type: "application/pdf",
    });

    const presigned = await api.post("/get-presigned-url");
    const { uploadUrl, fileUrl } = presigned.data;

    fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: pdfFile,
    })
      .then(() => {
        api
          .post(
            "/send-email",
            { url: fileUrl, ...meta },
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          )

          .then((res) => {
            if (res.data && res.data.success) {
              onComplete(!0);
            } else {
              onComplete(!1);
            }
          })
          .catch(() => {
            onComplete(!1);
          });
      })
      .catch(() => {
        onComplete(!1);
      });
  } catch {
    onComplete(!1);
  }
};
