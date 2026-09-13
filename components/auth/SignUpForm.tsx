"use client";

import { LocaleLink as NextLink } from "../LocaleLink";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";
import { AuthBox } from "../AuthBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "../../utils/supabase/browser";
import { updateUserName } from "../../utils/supabase-client";
import { useLocalePath } from "../../utils/use-language";
import { useUser } from "../../utils/useUser";
import { T, useT } from "@magic-translate/react";

export const SignUpForm = () => {
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
  const localePath = useLocalePath();
  const { user } = useUser();
  const { toast } = useToast();
  const t = useT();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage({});
    // v1 returned the user at the top level; v2 nests it under `data`.
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
    });
    const createdUser = data?.user ?? null;
    if (error) {
      setMessage({ type: "error", content: error.message });
    } else {
      // With email confirmation on, v2 still returns a user object but with no
      // session, so the name update would be rejected by RLS. Only write it
      // once there is a session to write it with.
      if (createdUser && data.session) {
        await updateUserName(createdUser.id, name);
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
      router.replace(localePath("/account"));
    }
  }, [newUser, user, router, localePath]);

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
