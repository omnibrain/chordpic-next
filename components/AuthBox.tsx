import { Box, Center, Flex, Heading } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";
import { Logo } from "./Logo";
import { T } from '@magic-translate/react'

export interface AuthBoxProps {
  title: string;
}

export const AuthBox: React.FunctionComponent<
  PropsWithChildren<AuthBoxProps>
> = ({ children, title }) => {
  return (
    <Flex justify="center">
      <Box
        flexBasis="22rem"
        p={4}
        shadow="lg"
        borderColor="primary"
        borderRadius="lg"
        borderWidth="2px"
      >
        <Center my={8} flexDir="column">
          <Logo width={12} height={12} />
          <Heading as="h1" size="md" fontWeight="normal" mt={8} mb={4}>
            <T>{title}</T>
          </Heading>
        </Center>

        {children}
      </Box>
    </Flex>
  );
};
