import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

import {
  Box,
  Button,
  Center,
  FormLabel,
  Input,
  Link,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Provider } from "@supabase/supabase-js";
import { AuthBox } from "../components/AuthBox";
import { getURL } from "../utils/helpers";
import { GetStaticPropsResult } from "next";

interface Props {
  title: string;
  description: string;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return {
    props: {
      title: "Sign in",
      description: "Sign in to your ChordPic account.",
    },
  };
}

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
  const toast = useToast();

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
      if (!password && !error) {
        toast({
          title: "Magic link sent!",
          description: "Check your email for the magic link.",
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
      <AuthBox title="Sign in to Chordpic">
        {message.content && (
          <Text color="red.500" fontSize="sm">
            {message.content}
          </Text>
        )}

        {!showPasswordInput && (
          <form onSubmit={handleSignin}>
            <Box display="flex" flexDir="column" gap={4}>
              <Box>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  border="2px"
                  borderColor="primary"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  colorScheme="teal"
                />
              </Box>
              <Button
                variant="solid"
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
            <Box display="flex" flexDir="column" gap={4}>
              <Box>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  width="100%"
                />
              </Box>
              <Box>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  width="100%"
                />
              </Box>
              <Button
                variant="outline"
                border="2px"
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

        <Box mt={4} mb={6} textAlign="center">
          <Link
            href="#"
            onClick={() => {
              if (showPasswordInput) setPassword("");
              setShowPasswordInput(!showPasswordInput);
              setMessage({});
            }}
          >
            {`Or sign in with ${showPasswordInput ? "magic link" : "password"}`}
          </Link>
          .
        </Box>

        {/* <Box display="flex" alignItems="center" my={8}>
          <Divider />
          <Box textAlign="center" px={8}>
            Or
          </Box>
          <Divider />
        </Box>

        <Button
          type="submit"
          disabled={loading}
          onClick={() => handleOAuthSignIn("google")}
          width="100%"
        >
          <Icon as={FaGoogle} mr={3} />
          Continue with Google
        </Button> */}

        <Box textAlign="center" mb={2} mt={6} fontSize="sm">
          <Box as="span">Don&apos;t have an account?</Box>
          {` `}
          <NextLink href="/signup" legacyBehavior>
            <Link>Sign up</Link>
          </NextLink>
          .
        </Box>
        <Box textAlign="center" my={2} fontSize="sm">
          <Box as="span">Forgot password?</Box>
          {` `}
          <NextLink href="/reset-password" legacyBehavior>
            <Link>Reset password</Link>
          </NextLink>
          .
        </Box>
      </AuthBox>
    );

  return (
    <Center mt={8}>
      <Spinner />
    </Center>
  );
};

export default SignIn;
