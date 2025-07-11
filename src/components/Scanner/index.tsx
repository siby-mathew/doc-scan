import {
  Box,
  Button,
  Flex,
  Input,
  SimpleGrid,
  Image,
  Icon,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import { createPdf, fixImageOrientation, swap } from "@utils/index";
import { useId, useState } from "react";

import { MdDelete, MdOutlineFileUpload, MdPhotoCamera } from "react-icons/md";

export const ScannerApp: React.FC = () => {
  const uid = useId();

  const [docs, setDocs] = useState<string[]>([]);
  const [selected, setSelected] = useState<number>(-1);
  const { isOpen } = useDisclosure();

  const onChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fixImageOrientation(file);
      if (base64) {
        setDocs((prev) => [...prev, base64]);
      }
    } catch {
      alert("Failed to load image");
    }
    e.target.value = "";
  };

  const onSwap = (index: number) => {
    if (docs.length <= 1) return;
    if (selected === -1) {
      setSelected(index);
    } else {
      setDocs((prev) => swap([...prev], selected, index));
      setSelected(-1);
    }
  };

  const removeByIndex = (index: number) => {
    setDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const { isOpen: isPending, onOpen: start, onClose: stop } = useDisclosure();
  const handleSend = () => {
    if (!isPending) {
      start();
      setTimeout(() => {
        createPdf(docs, (status) => {
          stop();
          if (status) {
            setDocs([]);
            setSelected(-1);
          }
        });
      });
    }
  };

  const HAS_IMAGES = docs && docs.length > 0;
  return (
    <Flex w="100%" direction={"column"}>
      <Flex
        hidden={HAS_IMAGES}
        w="100%"
        {...(HAS_IMAGES
          ? {}
          : {
              justifyContent: "center",
              alignItems: "center",
              minH: "80vh",
            })}
      >
        <Button
          size={"lg"}
          leftIcon={<MdPhotoCamera />}
          w="100%"
          variant={"ghost"}
          as={"label"}
          htmlFor={uid}
          bg="#181818"
          cursor={"pointer"}
          py={8}
          borderRadius={"lg"}
        >
          Open Camera
          <Input
            hidden
            id={uid}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onChangeHandler}
            multiple={false}
          />
        </Button>
      </Flex>

      {HAS_IMAGES && (
        <Flex w="100%" my={3} direction={"column"}>
          <SimpleGrid columns={3} spacing={4} position={"relative"}>
            {isPending && (
              <Flex
                bg="rgba(0,0,0,.8)"
                position={"absolute"}
                inset={0}
                justifyContent={"center"}
                alignItems={"center"}
                zIndex={2}
              >
                <Spinner />
              </Flex>
            )}
            {docs.map((image, index) => {
              return (
                <Box
                  key={index}
                  userSelect={"none"}
                  position={"relative"}
                  border={"solid 3px"}
                  borderRadius={5}
                  borderColor={selected === index ? "#fff" : "transparent"}
                  onClick={() => {
                    onSwap(index);
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
              htmlFor={!isOpen ? uid : "-"}
              border={"solid 3px"}
              borderColor={"transparent"}
              minH={150}
              _hover={{
                opacity: 0.8,
              }}
            >
              <Icon fontSize={30} as={MdPhotoCamera} />
            </Box>
          </SimpleGrid>
        </Flex>
      )}
      {HAS_IMAGES && (
        <>
          <Flex mt={3}>
            <Button size={"lg"} w="100%" onClick={handleSend}>
              Upload to mail
              <Icon as={MdOutlineFileUpload} ml={2} fontSize={25} />
            </Button>
          </Flex>
          <Flex w="100%" fontSize={12} opacity={0.3} mt={2}>
            Click an item to select it, then click another to swap their
            positions. You can use this to reorder the list easily.
          </Flex>
        </>
      )}
    </Flex>
  );
};
