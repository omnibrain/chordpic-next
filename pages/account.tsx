import NextLink from "next/link";
import { ReactNode, useState } from "react";

import { User, withAuthRequired } from "@supabase/supabase-auth-helpers/nextjs";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card as UICard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { postData } from "../utils/helpers";
import { useUser } from "../utils/useUser";
import { T, useT } from "@magic-translate/react";

interface Props {
  title: string;
  description?: string | React.ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

const Card = ({ title, description, footer, children }: Props) => (
  <UICard>
    <CardHeader>
      <CardTitle className="font-heading text-lg">
        <T>{title}</T>
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
    {footer && <CardFooter>{footer}</CardFooter>}
  </UICard>
);

export const getServerSideProps = withAuthRequired({ redirectTo: "/signin" });

export default function Account({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const { isLoading, subscription } = useUser();
  const t = useT();

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: "/api/create-portal-link",
      });
      window.location.assign(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
    setLoading(false);
  };

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: subscription?.prices?.currency,
      minimumFractionDigits: 0,
    }).format((subscription?.prices?.unit_amount || 0) / 100);

  return (
    <section>
      <h1 className="mb-12 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        <T>Account</T>
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          title={t("Your Plan")}
          description={
            subscription ? (
              <T>
                You are currently on the{" "}
                <strong>{subscription?.prices?.products?.name}</strong> plan.
              </T>
            ) : undefined
          }
          footer={
            subscription && (
              <div>
                <p className="mb-4 text-sm text-muted-foreground">
                  <T>Manage your subscription</T>
                </p>
                <Button disabled={loading} onClick={redirectToCustomerPortal}>
                  {loading && <Loader2 className="animate-spin" />}
                  <T>Open customer portal</T>
                </Button>
              </div>
            )
          }
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : subscription ? (
            <>
              {subscriptionPrice}/<T>{subscription?.prices?.interval}</T>
            </>
          ) : (
            <NextLink href="/pricing" className={buttonVariants()}>
              <T>Choose your plan</T>
            </NextLink>
          )}
        </Card>
        <Card title={t("Your Email")}>
          <p className="italic">{user ? user.email : undefined}</p>
        </Card>
      </div>
    </section>
  );
}
