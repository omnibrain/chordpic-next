"use client";

import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { useUser } from "@supabase/supabase-auth-helpers/react";
import NextLink from "@/components/LocalizedLink";
import { useLocalizedRouter } from "@/utils/use-localized-router";
import { FormEvent, useEffect, useState } from "react";

import { Provider } from "@supabase/supabase-js";
import { AuthBox } from "@/components/AuthBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MailCheck } from "lucide-react";
import { getURL } from "@/utils/helpers";
import { T, useT } from "@magic-translate/react";

const linkClasses = "font-medium underline underline-offset-4";

const MagicLinkSent: React.FunctionComponent<{
  email: string;
  onBack(): void;
}> = ({ email, onBack }) => {
  const t = useT();

  return (
    <AuthBox title={t("Check your email")}>
      <div
        role="status"
        className="flex flex-col items-center gap-4 pb-2 text-center"
      >
        <MailCheck className="h-10 w-10 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">
            <T>Magic link sent!</T>
          </p>
          <p className="text-sm text-muted-foreground">
            <T>We sent a sign-in link to</T>
          </p>
          <p className="break-all text-sm font-medium">{email}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          <T>
            Open the link on this device to sign in. Nothing after a minute?
            Have a look in your spam folder.
          </T>
        </p>
        <Button variant="outline" className="w-full" onClick={onBack}>
          <T>Use a different email</T>
        </Button>
      </div>
    </AuthBox>
  );
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkSentTo, setMagicLinkSentTo] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type?: string; content?: string }>({
    type: "",
    content: "",
  });
  const router = useLocalizedRouter();
  const { user } = useUser();
  const t = useT();

  const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      setLoading(true);
      setMessage({});

      const { error } = await supabaseClient.auth.signIn(
        { email, password },
        { redirectTo: getURL() },
      );
      if (error) {
        setMessage({ type: "error", content: error.message });
      }
      if (!password && !error) {
        setMagicLinkSentTo(email);
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

  if (!user && magicLinkSentTo)
    return (
      <MagicLinkSent
        email={magicLinkSentTo}
        onBack={() => setMagicLinkSentTo(null)}
      />
    );

  if (!user)
    return (
      <AuthBox title={t("Sign in to Chordpic")}>
        {message.content && (
          <p className="mb-4 text-sm text-destructive">
            <T>{message.content}</T>
          </p>
        )}

        {!showPasswordInput && (
          <form onSubmit={handleSignin}>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-2 block" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={loading || !email.length}
              >
                {loading && <Loader2 className="animate-spin" />}
                Send magic link
              </Button>
            </div>
          </form>
        )}

        {showPasswordInput && (
          <form onSubmit={handleSignin}>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-2 block" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="mb-2 block" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                variant="outline"
                type="submit"
                className="w-full"
                disabled={loading || !password.length || !email.length}
              >
                {loading && <Loader2 className="animate-spin" />}
                Sign in
              </Button>
            </div>
          </form>
        )}

        <div className="mb-6 mt-4 text-center text-sm">
          <a
            href="#"
            className={linkClasses}
            onClick={() => {
              if (showPasswordInput) setPassword("");
              setShowPasswordInput(!showPasswordInput);
              setMessage({});
            }}
          >
            {`Or sign in with ${showPasswordInput ? "magic link" : "password"}`}
          </a>
          .
        </div>

        <div className="mb-2 mt-6 text-center text-sm">
          <span>
            <T>Don&apos;t have an account?</T>
          </span>{" "}
          <NextLink href="/signup" className={linkClasses}>
            <T>Sign up</T>
          </NextLink>
          .
        </div>
        <div className="my-2 text-center text-sm">
          <span>
            <T>Forgot password?</T>
          </span>{" "}
          <NextLink href="/reset-password" className={linkClasses}>
            <T>Reset password</T>
          </NextLink>
          .
        </div>
      </AuthBox>
    );

  return (
    <div className="mt-8 flex justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
};

export default SignIn;
