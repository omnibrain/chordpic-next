import { chakra, useColorMode, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export const Logo: React.FunctionComponent = () => {
  const { colorMode } = useColorMode();

  return (
    <chakra.svg viewBox="0 0 100 100" height={8} width={8}>
      <chakra.circle
        r={50}
        fill={colorMode === "dark" ? "white" : "black"}
        cx={50}
        cy={50}
      />
    </chakra.svg>
  );
};
