import { chakra, LayoutProps, useColorMode } from "@chakra-ui/react";
import React from "react";

export const Logo: React.FunctionComponent<{
  height: LayoutProps["height"];
  width: LayoutProps["width"];
}> = ({ width, height }) => {
  const { colorMode } = useColorMode();

  return (
    <chakra.svg viewBox="0 0 100 100" height={height} width={width}>
      <chakra.circle
        r={50}
        fill={colorMode === "dark" ? "white" : "black"}
        cx={50}
        cy={50}
      />
    </chakra.svg>
  );
};
