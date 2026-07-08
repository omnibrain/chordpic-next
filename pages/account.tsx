import NextLink from "next/link";
import { ReactNode, useState } from "react";

import { User, withAuthRequired } from "@supabase/supabase-auth-helpers/nextjs";
import { Button, buttonClasses } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
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
  <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <h2 className="mb-3 font-heading text-lg font-semibold tracking-tight">
      <T>{title}</T>
    </h2>
    <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    <div className="mt-2">{children}</div>
    {footer && <div className="mt-6">{footer}</div>}
  </div>
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
            ) : (
              ""
            )
          }
          footer={
            subscription && (
              <div>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <T>Manage your subscription</T>
                </p>
                <Button isLoading={loading} onClick={redirectToCustomerPortal}>
                  <T>Open customer portal</T>
                </Button>
              </div>
            )
          }
        >
          {isLoading ? (
            <Spinner />
          ) : subscription ? (
            <>
              {subscriptionPrice}/<T>{subscription?.prices?.interval}</T>
            </>
          ) : (
            <NextLink href="/pricing" className={buttonClasses("solid")}>
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
