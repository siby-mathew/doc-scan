import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Image,
  Icon,
  Text,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";

import { PDFDocument } from "pdf-lib";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function getExifOrientation(base64: string): number {
  const binary = atob(base64.split(",")[1]);
  const view = new DataView(
    new Uint8Array([...binary].map((c) => c.charCodeAt(0))).buffer
  );

  let offset = 2;
  while (offset < view.byteLength) {
    if (view.getUint16(offset) === 0xffe1) {
      const marker = offset + 4;
      if (
        view.getUint32(marker) === 0x45786966 && // "Exif"
        view.getUint16(marker + 6) === 0x4949 // "II" - Intel format
      ) {
        const orientation = view.getUint16(marker + 10);
        return orientation;
      }
    }
    offset += 2;
  }
  return 1;
}

async function correctImageOrientation(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const orientation = getExifOrientation(base64);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      let { width, height } = img;

      if ([5, 6, 7, 8].includes(orientation)) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      switch (orientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, width, 0);
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, width, height);
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, height);
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, height, 0);
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, height, width);
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, width);
          break;
        default:
          break;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.src = base64;
  });
}

export const DocPreview: React.FC<{
  images: string[];
  removeByIndex: (index: number) => void;
  swap: (index: number) => void;
  selected: number;
  reset: () => void;
  id: string;
}> = ({ images, id, removeByIndex, selected, swap, reset }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const generatePdf = () => {
    onOpen();
    setTimeout(() => handleSend());
  };
  const handleSend = async () => {
    if (isOpen) return;

    try {
      const pdfDoc = await PDFDocument.create();
      for (const base64 of images) {
        const correctedBase64 =
          base64.startsWith("data:image/jpeg") ||
          base64.startsWith("data:image/jpg")
            ? await correctImageOrientation(base64)
            : base64;
        const imageBytes = Uint8Array.from(
          atob(correctedBase64.split(",")[1]),
          (c) => c.charCodeAt(0)
        );

        let embed;
        if (base64.startsWith("data:image/png")) {
          embed = await pdfDoc.embedPng(imageBytes);
        } else {
          embed = await pdfDoc.embedJpg(imageBytes);
        }

        const dims = embed.scale(0.5);
        const page = pdfDoc.addPage([dims.width, dims.height]);
        page.drawImage(embed, {
          x: 0,
          y: 0,
          width: dims.width,
          height: dims.height,
        });
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

      onClose();
      alert("Attachment sent");
      reset();
    } catch {
      alert("Failed to send email");
      onClose();
    }
  };

  return (
    <>
      {images && images.length > 0 && (
        <SimpleGrid columns={3} spacing={4}>
          {images.map((image, index) => {
            return (
              <Box
                key={index}
                userSelect={"none"}
                position={"relative"}
                border={"solid 3px"}
                borderRadius={5}
                borderColor={selected === index ? "#fff" : "transparent"}
                onClick={() => {
                  swap(index);
                }}
              >
                <Image
                  borderRadius={5}
                  w="100%"
                  src={image}
                  alt={`Image ${index}`}
                  h="100%"
                  objectFit={"cover"}
                />
                <Flex
                  position={"absolute"}
                  right={0}
                  bg="rgba(0,0,0,.6)"
                  left={0}
                  bottom={0}
                  justifyContent={"center"}
                  alignItems={"center"}
                  py={2}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    if (!isOpen) {
                      removeByIndex(index);
                    }
                  }}
                >
                  <Icon as={MdDelete} fontSize={20} />
                </Flex>
              </Box>
            );
          })}

          <Box
            as="label"
            bg={"#121212"}
            borderRadius={5}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            htmlFor={!isOpen ? id : ""}
            minH={150}
            _hover={{
              opacity: 0.8,
            }}
          >
            <Icon as={FaPlus} />
          </Box>
        </SimpleGrid>
      )}
      {images && images.length > 0 && (
        <>
          <Flex mt={4}>
            <Text fontSize={12} opacity={0.5}>
              Click an item to select it, then click another to swap their
              positions. You can use this to reorder the list easily.
            </Text>
          </Flex>
          <Flex w="full" mt={4}>
            <Button w="full" size={"lg"} onClick={generatePdf}>
              {isOpen && <Spinner mr={2} />}
              Create Document
            </Button>
          </Flex>
        </>
      )}
    </>
  );
};
