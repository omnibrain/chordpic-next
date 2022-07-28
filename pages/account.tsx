import NextLink from "next/link";
import { useState, ReactNode } from "react";

import { withAuthRequired, User } from "@supabase/supabase-auth-helpers/nextjs";
import {
  Box,
  Button,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { postData } from "../utils/helpers";
import { useUser } from "../utils/useUser";

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

const Card = ({ title, description, footer, children }: Props) => (
  <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
    <Box p={5}>
      <Heading size="md" mb={3}>
        {title}
      </Heading>
      <Text>{description}</Text>
      {children}
    </Box>
    <Box p={5}>{footer}</Box>
  </Box>
);

export const getServerSideProps = withAuthRequired({ redirectTo: "/signin" });

export default function Account({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const { isLoading, subscription, userDetails } = useUser();

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
    <Box as="section">
      <Heading as="h1" size="lg" mb={4}>
        Account
      </Heading>
      <SimpleGrid gap={3} minChildWidth="15rem">
        <Card
          title="Your Plan"
          description={
            subscription
              ? `You are currently on the ${subscription?.prices?.products?.name} plan.`
              : ""
          }
          footer={
            <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">
                Manage your subscription on Stripe.
              </p>
              <Button
                variant="solid"
                isLoading={loading}
                disabled={loading || !subscription}
                onClick={redirectToCustomerPortal}
              >
                Open customer portal
              </Button>
            </div>
          }
        >
          <div className="text-xl mt-8 mb-4 font-semibold">
            {isLoading ? (
              <Spinner />
            ) : subscription ? (
              `${subscriptionPrice}/${subscription?.prices?.interval}`
            ) : (
              <NextLink href="/pricing" passHref>
                <Button as="a">Choose your plan</Button>
              </NextLink>
            )}
          </div>
        </Card>
        <Card title="Your Name">
          <div className="text-xl mt-8 mb-4 font-semibold">
            {userDetails ? (
              `${
                userDetails.full_name ??
                `${userDetails.first_name} ${userDetails.last_name}`
              }`
            ) : (
              <div className="h-8 mb-6">...</div>
            )}
          </div>
        </Card>
        <Card title="Your Email">
          <Text as="i">{user ? user.email : undefined}</Text>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
