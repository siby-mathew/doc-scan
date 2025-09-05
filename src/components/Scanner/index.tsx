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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { UserDetails } from "@components/form";
import { createPdf, fixImageOrientation, swap } from "@utils/index";
import { useId, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { MdDelete, MdOutlineFileUpload, MdPhotoCamera } from "react-icons/md";

export const ScannerApp: React.FC = () => {
  const uid = useId();

  const [docs, setDocs] = useState<string[]>([]);
  const [selected, setSelected] = useState<number>(-1);
  const { isOpen } = useDisclosure();
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<FormType>();
  const [id, setId] = useState<number>(0);

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
  const { isOpen: isModalOpen, onOpen, onClose } = useDisclosure();
  const [status, setStatus] = useState(!0);

  const closeModal = () => {
    onClose();
    setStatus(!0);
  };

  type FormType = {
    phone: string;
    name: string;
    address: string;
  };

  const handleSend = () => {
    if (!isPending) {
      start();
      setTimeout(() => {
        createPdf({ images: docs, meta: data as FormType }, (status) => {
          stop();
          onOpen();
          if (status) {
            setDocs([]);
            setSelected(-1);
            setStep(0);
            setId(new Date().getTime());
          } else {
            setStatus(!1);
          }
        });
      });
    }
  };

  const HAS_IMAGES = docs && docs.length > 0;

  const onNext = (v: FormType) => {
    setStep((prev) => {
      return prev + 1;
    });
    setData(v);
  };
  return (
    <Flex w="100%" direction={"column"}>
      <Modal isCentered isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent color={!status ? "red.500" : ""} w="90%" bg="#161616">
          <ModalHeader>{status ? "Done" : "Error"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {status ? "Email sent successfully." : "Failed to send email."}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {step === 1 && (
        <>
          <Flex>
            <Button onClick={() => setStep(0)} leftIcon={<IoIosArrowBack />}>
              Edit Details
            </Button>
          </Flex>
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
            direction={"column"}
          >
            <Flex
              textAlign={"center"}
              p={3}
              border={"solid 1px"}
              borderColor={"#ffffff"}
              borderRadius={"10px"}
              mb={"25px"}
              fontSize={17}
            >
              This is a document scanner for your Vendor Onboarding (CDD). Open
              the camera, photograph your forms and ID documents, and submit
              them with your contact details. Not to be used for Trusts or
              Companies.
            </Flex>
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
              border={"solid 1px #fff !important"}
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
                <Button
                  border={"solid 1px #fff !important"}
                  size={"lg"}
                  w="100%"
                  onClick={handleSend}
                  h="60px"
                >
                  Submit Application
                  <Icon as={MdOutlineFileUpload} ml={2} fontSize={25} />
                </Button>
              </Flex>
              <Flex w="100%" mt={2} textAlign={"center"}>
                Click an item to select it, then click another to swap their
                positions. You can use this to reorder the list easily.
              </Flex>
            </>
          )}
        </>
      )}

      <Flex hidden={step !== 0} w="100%" direction={"column"}>
        <UserDetails key={id} onSubmit={onNext} />
      </Flex>
    </Flex>
  );
};
