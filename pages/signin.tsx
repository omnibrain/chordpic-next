import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

import {
  Box,
  Button,
  Input,
  Text,
  Link,
  Spinner,
  Center,
  SimpleGrid,
  Wrap,
  WrapItem,
  Flex,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { Provider } from "@supabase/supabase-js";
import { getURL } from "../utils/helpers";
import { Logo } from "../components/Logo";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type?: string; content?: string }>({
    type: "",
    content: "",
  });
  const router = useRouter();
  const { user } = useUser();

  const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      setLoading(true);
      setMessage({});

      const { error } = await supabaseClient.auth.signIn(
        { email, password },
        { redirectTo: getURL() }
      );
      if (error) {
        setMessage({ type: "error", content: error.message });
      }
      if (!password) {
        setMessage({
          type: "note",
          content: "Check your email for the magic link.",
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to log in", err);
      throw err;
    }
  };

  const handleOAuthSignIn = async (provider: Provider) => {
    setLoading(true);
    const { error } = await supabaseClient.auth.signIn({ provider });
    if (error) {
      setMessage({ type: "error", content: error.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [user, router]);

  if (!user)
    return (
      <Flex justify="center">
        <Box flexBasis="22rem" p={4} shadow="md" border="2px" borderRadius="lg">
          <Center my={8} flexDir="column">
            <Logo width={12} height={12} />
            <Heading as="h1" size="md" mt={8} mb={4}>
              Sign in to Chordpic
            </Heading>
          </Center>

          {message.content && (
            <Text color="red.500" fontSize="sm">
              {message.content}
            </Text>
          )}

          {!showPasswordInput && (
            <form onSubmit={handleSignin}>
              <Box>
                <Box>
                  <Input
                    type="email"
                    placeholder="Email"
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
                  Send magic link
                </Button>
              </Box>
            </form>
          )}

          {showPasswordInput && (
            <form onSubmit={handleSignin}>
              <Box
                display="flex"
                flexDir="column"
                alignItems="flex-start"
                gap={3}
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  className="mt-1"
                  type="submit"
                  isLoading={loading}
                  disabled={!password.length || !email.length}
                  width="100%"
                >
                  Sign in
                </Button>
              </Box>
            </form>
          )}

          <Box mt={4} textAlign="center">
            <Link
              href="#"
              onClick={() => {
                if (showPasswordInput) setPassword("");
                setShowPasswordInput(!showPasswordInput);
                setMessage({});
              }}
            >
              {`Or sign in with ${
                showPasswordInput ? "magic link" : "password"
              }`}
            </Link>
            .
          </Box>

          <Box textAlign="center" my={2}>
            <Box as="span">Don&apos;t have an account?</Box>
            {` `}
            <NextLink href="/signup">
              <Link>Sign up</Link>
            </NextLink>
            .
          </Box>

          <Divider />

          <Box textAlign="center" my={4}>
            Or
          </Box>

          <Button
            type="submit"
            disabled={loading}
            onClick={() => handleOAuthSignIn("github")}
            width="100%"
          >
            Continue with GitHub
          </Button>
        </Box>
      </Flex>
    );

  return (
    <Center mt={8}>
      <Spinner />
    </Center>
  );
};

export default SignIn;
