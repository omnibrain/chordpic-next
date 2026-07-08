import { FormEvent, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { AuthBox } from "../components/AuthBox";
import { Button } from "../components/ui/Button";
import { FormLabel, Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
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
  const toast = useToast();
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
          status: "success",
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
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          <T>{message.content}</T>
        </p>
      )}

      <form onSubmit={handleReset}>
        <div className="flex flex-col gap-4">
          <div>
            <FormLabel htmlFor="password">
              <T>New password</T>
            </FormLabel>
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
            <FormLabel htmlFor="confirm-password">
              Confirm new password
            </FormLabel>
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
            isLoading={mutation.isLoading}
            disabled={!password.length || !passwordConfirmation.length}
          >
            <T>Set new password</T>
          </Button>
        </div>
      </form>
    </AuthBox>
  );
};

export default NewPassword;
