import { FormEvent, useState } from "react";

import {
  Box,
  Button,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { AuthBox } from "../components/AuthBox";
import { getURL } from "../utils/helpers";
import { supabase } from "../utils/supabase-client";
import { T, useT } from "@magic-translate/react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type?: string; content?: string }>({
    type: "",
    content: "",
  });
  const toast = useToast();
  const t = useT();

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      setLoading(true);
      setMessage({});

      const { error } = await supabase.auth.api.resetPasswordForEmail(email, {
        redirectTo: getURL(),
      });
      if (error) {
        setMessage({ type: "error", content: error.message });
      } else {
        toast({
          title: "Please check your email!",
          description: "Check your email for a password reset link.",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      }

      setLoading(false);
    } catch (err) {
      console.error("Failed to log in", err);
      throw err;
    }
  };

  return (
    <AuthBox title={t("Reset password")}>
      {message.content && (
        <Text color="red.500" fontSize="sm" mb={4}>
          <T>{message.content}</T>
        </Text>
      )}

      <form onSubmit={handleReset}>
        <Box>
          <Box>
            <FormLabel htmlFor="email">
              <T>Email</T>
            </FormLabel>
            <Input
              id="email"
              name="email"
              border="2px"
              borderColor="primary"
              type="email"
              placeholder={t("Email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Box>
          <Button
            mt={4}
            type="submit"
            isLoading={loading}
            disabled={!email.length}
            width="100%"
          >
            <T>Reset password</T>
          </Button>
        </Box>
      </form>
    </AuthBox>
  );
};

export default ResetPassword;
