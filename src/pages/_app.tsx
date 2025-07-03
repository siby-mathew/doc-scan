import { AppLayout } from "@layout/main";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@theme/index";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </ChakraProvider>
  );
}
