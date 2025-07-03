import { Box, Button, Flex } from "@chakra-ui/react";
import { useId, useState } from "react";
import { CgScan } from "react-icons/cg";
import { DocPreview } from "./Preview";
import { swap } from "@utils/index";

export const Scanner: React.FC = () => {
  const id = useId();
  const [images, setImages] = useState<string[]>([]);
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      alert("No file selected.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Selected file is not an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;
      setImages((prev) => [...prev, imageDataUrl]);
    };
    reader.readAsDataURL(file);
  };

  const removeByIndex = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const [selected, setSelected] = useState<number>(-1);
  const onSwap = (index: number) => {
    if (selected === -1) {
      setSelected(index);
    } else {
      setImages((prev) => swap([...prev], selected, index));
      setSelected(-1);
    }
  };
  const reset = () => {
    setImages([]);
  };

  return (
    <Box w="100%">
      <Flex w="100%" mb={4}>
        <Button
          leftIcon={<CgScan />}
          size={"lg"}
          as="label"
          htmlFor={id}
          w="full"
        >
          Scan Document
          <input
            type="file"
            hidden
            id={id}
            accept="image/*"
            capture="environment"
            onChange={onChangeHandler}
            multiple={false}
          />
        </Button>
      </Flex>
      <DocPreview
        swap={onSwap}
        selected={selected}
        removeByIndex={removeByIndex}
        images={images}
        reset={reset}
      />
    </Box>
  );
};
