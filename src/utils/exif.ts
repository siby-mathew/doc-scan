// import EXIF from "exif-js";
export const fixImageOrientation = function (file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // EXIF.getData(img as any, function () {
        // const orientation = EXIF.getTag(this, "Orientation") as number;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        canvas.width = width;
        canvas.height = height;
        // if ([5, 6, 7, 8].includes(orientation)) {
        //   canvas.width = height;
        //   canvas.height = width;
        // } else {
        //   canvas.width = width;
        //   canvas.height = height;
        // }

        // switch (orientation) {
        //   case 2:
        //     ctx.transform(-1, 0, 0, 1, width, 0);
        //     break;
        //   case 3:
        //     ctx.transform(-1, 0, 0, -1, width, height);
        //     break;
        //   case 4:
        //     ctx.transform(1, 0, 0, -1, 0, height);
        //     break;
        //   case 5:
        //     ctx.transform(0, 1, 1, 0, 0, 0);
        //     break;
        //   case 6:
        //     ctx.transform(0, 1, -1, 0, height, 0);
        //     break;
        //   case 7:
        //     ctx.transform(0, -1, -1, 0, height, width);
        //     break;
        //   case 8:
        //     ctx.transform(0, -1, 1, 0, 0, width);
        //     break;
        //   default:
        //     break;
        // }

        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/jpeg", 1.0));
        // });
      };
      img.src = event.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
};
