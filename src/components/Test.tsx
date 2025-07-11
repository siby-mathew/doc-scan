import React, { useRef, useState } from "react";

const MAX_WIDTH = 800;

export default function ImageCanvasUploader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Scale image if needed
        const scale = Math.min(MAX_WIDTH / img.width, 1);
        const width = img.width * scale;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        localStorage.setItem("i", canvas.toDataURL("image/jpeg", 1.0));
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        accept="image/*"
        capture="environment"
        type="file"
        onChange={handleFileChange}
      />
      {fileName && <p>Showing: {fileName}</p>}
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc", marginTop: "10px" }}
      />
    </div>
  );
}
