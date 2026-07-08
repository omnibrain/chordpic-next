import { FormEvent, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { AuthBox } from "../components/AuthBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../utils/supabase-client";
import { useUser } from "../utils/useUser";
import { T, useT } from "@magic-translate/react";

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
  const { toast } = useToast();
  const t = useT();

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
          duration: 9000,
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
        <p className="mb-4 text-sm text-destructive">
          <T>{message.content}</T>
        </p>
      )}

      <form onSubmit={handleReset}>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-2 block" htmlFor="password">
              <T>New password</T>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("Password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-2 block" htmlFor="confirm-password">
              Confirm new password
            </Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder={t("Confirm password")}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={
              mutation.isLoading ||
              !password.length ||
              !passwordConfirmation.length
            }
          >
            {mutation.isLoading && <Loader2 className="animate-spin" />}
            <T>Set new password</T>
          </Button>
        </div>
      </form>
    </AuthBox>
  );
};

export default NewPassword;
