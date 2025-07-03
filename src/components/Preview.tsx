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

import { MdDelete } from "react-icons/md";

export const DocPreview: React.FC<{
  images: string[];
  removeByIndex: (index: number) => void;
  swap: (index: number) => void;
  selected: number;
  reset: () => void;
}> = ({ images, removeByIndex, selected, swap, reset }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSend = async () => {
    if (isOpen) return;
    onOpen();

    try {
      // Step 1: Create PDF from base64 images
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

      // Step 2: Get S3 presigned URL from backend
      const presigned = await fetch("/api/get-presigned-url");
      const { uploadUrl, fileUrl } = await presigned.json();

      // Step 3: Upload to S3

      console.log(uploadUrl, fileUrl);
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: pdfFile,
      });

      // Step 4: Send file URL to backend to trigger email
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fileUrl }),
      });

      onClose();
      alert("Attachment sent");
      reset();
    } catch (err) {
      console.error("Upload or Email Error:", err);
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
                <Image borderRadius={5} w="100%" h="auto" src={image} />
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
                    removeByIndex(index);
                  }}
                >
                  <Icon as={MdDelete} fontSize={20} />
                </Flex>
              </Box>
            );
          })}
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
            <Button w="full" size={"lg"} onClick={handleSend}>
              {isOpen && <Spinner mr={2} />}
              Create Document
            </Button>
          </Flex>
        </>
      )}
    </>
  );
};
