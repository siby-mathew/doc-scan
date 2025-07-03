import { PDFDocument } from "pdf-lib";
export const createPdfFromBase64Images = async (
  base64Images: string[]
): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();

  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  for (const base64 of base64Images) {
    const cleanedBase64 = base64.replace(/^data:image\/(png|jpeg);base64,/, "");
    const bytes = Uint8Array.from(atob(cleanedBase64), (c) => c.charCodeAt(0));

    let image;
    if (base64.startsWith("data:image/jpeg")) {
      image = await pdfDoc.embedJpg(bytes);
    } else if (base64.startsWith("data:image/png")) {
      image = await pdfDoc.embedPng(bytes);
    } else {
      continue;
    }

    const { width: imgWidth, height: imgHeight } = image.scale(1);
    const aspectRatio = imgWidth / imgHeight;

    // Fit image into A4 dimensions while maintaining aspect ratio
    let drawWidth = A4_WIDTH;
    let drawHeight = A4_WIDTH / aspectRatio;
    if (drawHeight > A4_HEIGHT) {
      drawHeight = A4_HEIGHT;
      drawWidth = A4_HEIGHT * aspectRatio;
    }

    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    page.drawImage(image, {
      x: (A4_WIDTH - drawWidth) / 2,
      y: (A4_HEIGHT - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};

export const swap = (
  array: string[],
  currentIndex: number,
  swapToPosition: number
) => {
  if (
    currentIndex === -1 ||
    swapToPosition < 0 ||
    swapToPosition >= array.length
  ) {
    return array;
  }
  const itemToSwap = array[currentIndex];
  const newArray = [...array];
  newArray.splice(currentIndex, 1);
  newArray.splice(swapToPosition, 0, itemToSwap);

  return newArray;
};
