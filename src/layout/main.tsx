import { Box, Container } from "@chakra-ui/react";
import type { ReactNode } from "react";

export const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Container w="100%">
      <Box
        bgGradient="linear(to-r, green.200, pink.500)"
        fontWeight={"bold"}
        bgClip={"text"}
        py={4}
        fontSize={20}
      >
        Doc.Scanner
      </Box>
      <Box>{children}</Box>
    </Container>
  );
};
