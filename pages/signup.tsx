import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

import { Box, Button, Flex, Input, Link, useToast } from "@chakra-ui/react";
import { User } from "@supabase/gotrue-js";
import { AuthBox } from "../components/AuthBox";
import { updateUserName } from "../utils/supabase-client";
import { GetStaticPropsResult } from "next";
import { T, useT } from "@magic-translate/react";

interface Props {
  title: string;
  description: string;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return {
    props: {
      title: "Sign up",
      description:
        "Sign up for ChordPic to create beautiful guitar chord charts.",
    },
  };
}

const SignUp = () => {
  const [newUser, setNewUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type?: string; content?: string }>({
    type: "",
    content: "",
  });
  const router = useRouter();
  const { user } = useUser();
  const toast = useToast();
  const t = useT();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage({});
    const { error, user: createdUser } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage({ type: "error", content: error.message });
    } else {
      if (createdUser) {
        await updateUserName(createdUser, name);
        setNewUser(createdUser);
      } else {
        toast({
          title: "Please verify email",
          description: "Check your email for the confirmation link.",
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (newUser || user) {
      router.replace("/account");
    }
  }, [newUser, user, router]);

  return (
    <AuthBox title={t("Sign up for Chordpic")}>
      <form onSubmit={handleSignup} className="flex flex-col space-y-4">
        {message.content && (
          <div
            className={`${
              message.type === "error" ? "text-pink-500" : "text-green-500"
            } border ${
              message.type === "error" ? "border-pink-500" : "border-green-500"
            } p-3`}
          >
            <T>{message.content}</T>
          </div>
        )}
        <Flex direction="column" gap={2}>
          <Input
            placeholder={t("Name")}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder={t("Email")}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder={t("Password")}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Flex>
        <Button
          my={6}
          type="submit"
          isLoading={loading}
          disabled={loading || !email.length || !password.length}
          width="100%"
        >
          Sign up
        </Button>

        <Box textAlign="center">
          <Box as="span">
            <T>Do you have an account?</T>
          </Box>
          {` `}
          <NextLink href="/signin" passHref legacyBehavior>
            <Link>
              <T>Sign in</T>
            </Link>
          </NextLink>
        </Box>
      </form>
    </AuthBox>
  );
};

export default SignUp;
