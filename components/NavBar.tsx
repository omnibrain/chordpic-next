import {
  Box,
  Button,
  chakra,
  Flex,
  FormControl,
  FormLabel,
  Link,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { PropsWithChildren } from "react";
import { Switch } from "@chakra-ui/react";
import { MoonIcon } from "@chakra-ui/icons";
import { useUser } from "../utils/useUser";

const Logo: React.FunctionComponent = () => {
  const bg = useColorModeValue("black", "white");

  return (
    <Box>
      <NextLink href="/" passHref>
        <Link display="flex" alignItems="center" gap={3} fontSize={20}>
          <chakra.svg viewBox="0 0 100 100" height={7} width={7}>
            <chakra.circle r={50} fill={bg} cx={50} cy={50} />
          </chakra.svg>
          Chordpic
        </Link>
      </NextLink>
    </Box>
  );
};

const CloseIcon = () => {
  const bg = useColorModeValue("black", "white");

  return (
    <svg width="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <title>Close</title>
      <path
        fill={bg}
        d="M9.00023 7.58599L13.9502 2.63599L15.3642 4.04999L10.4142 8.99999L15.3642 13.95L13.9502 15.364L9.00023 10.414L4.05023 15.364L2.63623 13.95L7.58623 8.99999L2.63623 4.04999L4.05023 2.63599L9.00023 7.58599Z"
      />
    </svg>
  );
};

const MenuIcon = () => {
  const fill = useColorModeValue("black", "white");
  return (
    <svg
      width="24px"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
    >
      <title>Menu</title>
      <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
    </svg>
  );
};

const MenuToggle: React.FunctionComponent<{
  toggle(): void;
  isOpen: boolean;
}> = ({ toggle, isOpen }) => {
  return (
    <Box display={{ base: "block", md: "none" }} onClick={toggle}>
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </Box>
  );
};

const MenuItem: React.FunctionComponent<
  PropsWithChildren<{ isLast?: boolean; to: string }>
> = ({ children, to = "/" }) => {
  return (
    <NextLink href={to} passHref>
      <Link whiteSpace="nowrap">{children}</Link>
    </NextLink>
  );
};

const MenuLinks: React.FunctionComponent<{ isOpen: boolean }> = ({
  isOpen,
}) => {
  const { user } = useUser();
  const { asPath } = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  const highlightButtonBg = useColorModeValue("black", "white");
  const highlightButtonBgHover = useColorModeValue("gray.700", "gray.300");
  const highlightButtonColor = useColorModeValue("white", "black");

  console.log(user);

  return (
    <Box
      display={{ base: isOpen ? "block" : "none", md: "block" }}
      flexBasis={{ base: "100%", md: "auto" }}
    >
      <Stack
        spacing={8}
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "row", "row", "row"]}
        pt={[4, 4, 0, 0]}
      >
        {asPath !== "/" && (
          <MenuItem to="/signup" isLast={true}>
            <Button
              as="span"
              size="md"
              rounded="md"
              color={highlightButtonColor}
              bg={highlightButtonBg}
              _hover={{
                bg: highlightButtonBgHover,
              }}
            >
              Create chord diagram
            </Button>
          </MenuItem>
        )}
        <FormControl
          display="flex"
          alignItems="center"
          justifyContent={["center", "flex-end", "center", "center"]}
        >
          <FormLabel
            htmlFor="dark-mode"
            mb="0"
            display="flex"
            alignItems="center"
          >
            <MoonIcon />
          </FormLabel>
          <Switch
            id="dark-mode"
            onChange={toggleColorMode}
            isChecked={colorMode === "dark"}
          />
        </FormControl>
        <MenuItem to="/pricing">Pricing</MenuItem>
        <MenuItem to="/account">Account</MenuItem>
        {user ? (
          <MenuItem to="/api/auth/logout">Sign out</MenuItem>
        ) : (
          <MenuItem to="/signin">Sign in</MenuItem>
        )}
      </Stack>
    </Box>
  );
};

const NavBarContainer: React.FunctionComponent<PropsWithChildren<{}>> = ({
  children,
  ...props
}) => {
  const textColor = useColorModeValue("black", "white");
  const bg = useColorModeValue("gray.100", "gray.900");

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      p={4}
      bg={bg}
      color={textColor}
      {...props}
    >
      {children}
    </Flex>
  );
};

export const NavBar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <NavBarContainer>
      <Logo />
      <MenuToggle toggle={toggle} isOpen={isOpen} />
      <MenuLinks isOpen={isOpen} />
    </NavBarContainer>
  );
};
