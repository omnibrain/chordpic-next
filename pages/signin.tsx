import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

import { Box, Button, Input, Text, Link } from "@chakra-ui/react";
import { Provider } from "@supabase/supabase-js";
import { getURL } from "../utils/helpers";

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
      <div className="flex justify-center height-screen-helper">
        <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
          {message.content && (
            <Text color="red.500" fontSize="sm">
              {message.content}
            </Text>
          )}

          {!showPasswordInput && (
            <form onSubmit={(e) => handleSignin}>
              <Box display="flex" gap={3}>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={!email.length}
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
                >
                  Sign in
                </Button>
              </Box>
            </form>
          )}

          <Box mt={3}>
            <Link
              href="#"
              onClick={() => {
                if (showPasswordInput) setPassword("");
                setShowPasswordInput(!showPasswordInput);
                setMessage({});
              }}
              textDecor="underline"
            >
              {`Or sign in with ${
                showPasswordInput ? "magic link" : "password"
              }`}
            </Link>
            .
          </Box>

          <span className="pt-1 text-center text-sm">
            <span className="text-zinc-200">Don&apos;t have an account?</span>
            {` `}
            <NextLink href="/signup">
              <Link textDecor="underline">Sign up</Link>
            </NextLink>
            .
          </span>
        </div>

        <div className="flex items-center my-6">
          <div
            className="border-t border-zinc-600 flex-grow mr-3"
            aria-hidden="true"
          ></div>
          <div className="text-zinc-400">Or</div>
          <div
            className="border-t border-zinc-600 flex-grow ml-3"
            aria-hidden="true"
          ></div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          onClick={() => handleOAuthSignIn("github")}
        >
          Continue with GitHub
        </Button>
      </div>
    );

  return <div className="m-6">...</div>;
};

export default SignIn;
