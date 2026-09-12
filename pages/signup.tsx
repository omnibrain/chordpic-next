import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { localizedMeta, PageMetaProps } from "../services/page-meta";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

import { User } from "@supabase/gotrue-js";
import { AuthBox } from "../components/AuthBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserName } from "../utils/supabase-client";
import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { T, useT } from "@magic-translate/react";

type Props = PageMetaProps;

export async function getStaticProps({
  locale,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  return {
    props: await localizedMeta(locale, {
      title: "Sign up",
      description:
        "Sign up for ChordPic to create beautiful guitar chord charts.",
    }),
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
  const { toast } = useToast();
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
            className={`rounded-lg border p-3 text-sm ${
              message.type === "error"
                ? "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400"
                : "border-emerald-300 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"
            }`}
          >
            <T>{message.content}</T>
          </div>
        )}
        <div className="flex flex-col gap-2">
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
        </div>
        <Button
          type="submit"
          className="my-6 w-full"
          disabled={loading || !email.length || !password.length}
        >
          {loading && <Loader2 className="animate-spin" />}
          Sign up
        </Button>

        <div className="text-center text-sm">
          <span>
            <T>Do you have an account?</T>
          </span>{" "}
          <NextLink
            href="/signin"
            className="font-medium underline underline-offset-4"
          >
            <T>Sign in</T>
          </NextLink>
        </div>
      </form>
    </AuthBox>
  );
};

export default SignUp;
