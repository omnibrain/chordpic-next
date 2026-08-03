import { FormEvent, useState } from "react";

import { AuthBox } from "../components/AuthBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
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
          duration: 9000,
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
        <p className="mb-4 text-sm text-destructive">
          <T>{message.content}</T>
        </p>
      )}

      <form onSubmit={handleReset}>
        <div>
          <Label className="mb-2 block" htmlFor="email">
            <T>Email</T>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("Email")}
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
          <T>Reset password</T>
        </Button>
      </form>
    </AuthBox>
  );
};

export default ResetPassword;
