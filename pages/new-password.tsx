import { FormEvent, useState } from "react";

import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { AuthBox } from "../components/AuthBox";
import { supabase } from "../utils/supabase-client";
import { useUser } from "../utils/useUser";

const useUpdatePasswordMutation = () => {
  const { accessToken } = useUser();

  return useMutation((newPassword: string) => {
    if (!accessToken) {
      throw new Error("Unauthenticated");
    }

    return supabase.auth.api.updateUser(accessToken, {
      password: newPassword,
    });
  });
};

const NewPassword = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const mutation = useUpdatePasswordMutation();
  const [message, setMessage] = useState<{ type?: string; content?: string }>({
    type: "",
    content: "",
  });
  const toast = useToast();

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password) {
      setMessage({ type: "error", content: "Please enter a new password" });
      return;
    }
    if (password.length < 8) {
      setMessage({
        type: "error",
        content: "Password must have at least 8 characters",
      });
      return;
    }
    if (password !== passwordConfirmation) {
      setMessage({
        type: "error",
        content: "Passwords don't match",
      });
      return;
    }

    try {
      setMessage({});

      const { error } = await mutation.mutateAsync(password);
      if (error) {
        setMessage({ type: "error", content: error.message });
      } else {
        toast({
          title: "New password set!",
          description: "Use the new password for logging in from now on.",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
        router.push("/account");
      }
    } catch (err) {
      console.error("Failed set new password", err);
      throw err;
    }
  };

  return (
    <AuthBox title="Set new password">
      {message.content && (
        <Text color="red.500" fontSize="sm" mb={4}>
          {message.content}
        </Text>
      )}

      <form onSubmit={handleReset}>
        <Flex direction="column" gap={4}>
          <Box>
            <FormLabel htmlFor="password">New password</FormLabel>
            <Input
              id="password"
              name="password"
              border="2px"
              borderColor="primary"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>
          <Box>
            <FormLabel htmlFor="password">Confirm new password</FormLabel>
            <Input
              id="confirm-password"
              name="confirm-password"
              border="2px"
              borderColor="primary"
              type="password"
              placeholder="Confirm password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </Box>
          <Button
            mt={4}
            type="submit"
            isLoading={mutation.isLoading}
            disabled={!password.length || !passwordConfirmation.length}
            width="100%"
          >
            Set new password
          </Button>
        </Flex>
      </form>
    </AuthBox>
  );
};

export default NewPassword;
