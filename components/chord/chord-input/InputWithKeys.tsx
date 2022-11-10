import { Box, Button, ChakraComponent, Input } from "@chakra-ui/react";
import { ChangeEventHandler, FormEvent, useCallback, useState } from "react";

export interface InputWithKeysProps {
  value: string;
  onChange: (value: string) => void;
  placement: "left" | "right";
}

export const InputWithKeys: ChakraComponent<"div", InputWithKeysProps> = ({
  onChange,
  value,
  placement,
  ...boxProps
}) => {
  const [hasFocus, setHasFocus] = useState(false);

  const onBlur = useCallback(() => {
    setTimeout(() => setHasFocus(false), 200);
  }, []);

  return (
    <Box {...boxProps} position="relative">
      <Input
        onFocus={() => setHasFocus(true)}
        onBlur={onBlur}
        p={0}
        type="text"
        onChange={(e) => onChange(e.target.value)}
        value={value}
        width="100%"
        height="100%"
        bg="inverse"
        color="primary"
        border="2px solid"
        borderColor="primary"
        textAlign="center"
      />
      {hasFocus && (
        <Box
          zIndex={1}
          position="absolute"
          display="flex"
          gap={1}
          left={0}
          top={0}
          transform={"translateY(-120%)"}
          height="100%"
        >
          <Button
            height="100%"
            variant="solid"
            size="xs"
            onClick={() => onChange(value + "♯")}
          >
            ♯
          </Button>
          <Button
            height="100%"
            variant="solid"
            size="xs"
            onClick={() => onChange(value + "♭")}
          >
            ♭
          </Button>
        </Box>
      )}
    </Box>
  );
};
