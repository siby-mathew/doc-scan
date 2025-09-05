import { Box, Button, Container, Flex, Spinner } from "@chakra-ui/react";
import Image from "next/image";
import type { ReactNode } from "react";
import logo from "../assets/logo.png";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
export const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authenticated, login, user, logout, ready } = usePrivy();
  return (
    <Container w="100%">
      <Box
        as={Link}
        href={"/"}
        fontWeight={"bold"}
        py={4}
        fontSize={20}
        display={"flex"}
        gap={2}
      >
        <Image
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
          }}
          src={logo}
          alt="logo"
        />
        HALO AML
      </Box>
      {ready && (
        <>
          {authenticated && (
            <Flex
              pb={3}
              mb={2}
              borderBottom={"solid 1px #272727ff"}
              direction={"column"}
            >
              <Flex>Loggedin as : {user?.email?.address}</Flex>
              <Flex my={1} gap={1}>
                <Button
                  as={Link}
                  size={"sm"}
                  colorScheme="green"
                  href={"/list"}
                >
                  View listed items
                </Button>
                <Button onClick={logout} size={"sm"} colorScheme="green">
                  Logout
                </Button>
              </Flex>
            </Flex>
          )}
          {authenticated && <Box>{children}</Box>}
          {!authenticated && (
            <Flex minH={"80vh"} alignItems={"center"} justifyContent={"center"}>
              <Button w="full" size={"lg"} onClick={login}>
                Login
              </Button>
            </Flex>
          )}
        </>
      )}

      {!ready && (
        <Flex
          w="100%"
          minH={300}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Spinner />
        </Flex>
      )}
    </Container>
  );
};
