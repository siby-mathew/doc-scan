import {
  Flex,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  VStack,
} from "@chakra-ui/react";
import { useData } from "../hooks/useData";

export const ListingPage = () => {
  const { data, isLoading } = useData();
  return (
    <Flex w="100%">
      {isLoading && (
        <Flex
          w="100%"
          minH={300}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Spinner />
        </Flex>
      )}

      {!isLoading && data && data.data && data.data.map && (
        <VStack>
          {data.data.map((item) => {
            return (
              <Stat key={item.id} w="100%">
                <StatLabel>
                  {item.name} | {item.phone}
                </StatLabel>

                <StatHelpText>{item.office}</StatHelpText>
              </Stat>
            );
          })}
        </VStack>
      )}
    </Flex>
  );
};

export default ListingPage;
