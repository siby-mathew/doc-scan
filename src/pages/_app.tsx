import { AppLayout } from "@layout/main";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@theme/index";
import type { AppProps } from "next/app";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={client}>
        <PrivyProvider
          appId="cmf59z1hu008cl70bamyvw1an"
          config={{
            loginMethods: ["email", "google"],
            appearance: {
              loginMessage: "cdd-halo",
              landingHeader: "cdd-halo-app",
            },
          }}
        >
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </PrivyProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
