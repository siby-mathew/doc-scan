import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  styles: {
    global: {
      "html, body": {
        fontFamily: '"Roboto", sans-serif',
        bg: "#000",
        color: "whiteAlpha.900",
      },
    },
  },

  colors: {
    brand: {
      50: "#e3f9ff",
      100: "#c1e0ff",
      900: "#0d1a26",
    },
  },
});

export default theme;
