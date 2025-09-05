import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const primary = definePartsStyle({
  field: {
    bg: "#101010",
    p: 8,
    px: 4,
    borderRadius: 5,
  },
});

export const Input = defineMultiStyleConfig({
  defaultProps: {
    variant: "primary",
  },
  variants: {
    primary,
  },
});

const textarea = defineStyle({
  bg: "#101010",
  resize: "none",
});

export const Textarea = defineStyleConfig({
  variants: { textarea },
  defaultProps: {
    variant: "textarea",
  },
});
