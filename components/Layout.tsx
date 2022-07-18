import { Container, SimpleGrid } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";
import { NavBar } from "./NavBar";

export interface LayoutProps {}

export const Layout: React.FunctionComponent<
  PropsWithChildren<LayoutProps>
> = ({ children }) => {
  return (
    <SimpleGrid row={["100px", null]} spacing="40px">
      <NavBar />
      <Container maxW="container.lg">{children}</Container>
    </SimpleGrid>
  );
};
