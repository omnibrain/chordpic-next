import NextLink from "next/link";
import { ReactNode, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { User, withAuthRequired } from "@supabase/supabase-auth-helpers/nextjs";
import { postData } from "../utils/helpers";
import { useUser } from "../utils/useUser";

interface Props {
  title: string;
  description?: string | React.ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

const Card = ({ title, description, footer, children }: Props) => (
  <Box
    maxW="sm"
    borderRadius="lg"
    overflow="hidden"
    flexBasis="22rem"
    p={4}
    shadow="md"
    border="2px"
    borderColor="primary"
  >
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
  const { isLoading, subscription } = useUser();

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
      <Heading as="h1" size="xl" mb={12}>
        Account
      </Heading>
      <SimpleGrid gap={3} minChildWidth="15rem">
        <Card
          title="Your Plan"
          description={
            subscription ? (
              <>
                You are currently on the{" "}
                <Badge>{subscription?.prices?.products?.name}</Badge> plan.
              </>
            ) : (
              ""
            )
          }
          footer={
            <>
              {subscription && (
                <Box>
                  <Text mb={4}>Manage your subscription</Text>
                  <Button
                    variant="solid"
                    isLoading={loading}
                    // disabled={loading || !subscription}
                    onClick={redirectToCustomerPortal}
                  >
                    Open customer portal
                  </Button>
                </Box>
              )}
            </>
          }
        >
          <Box>
            {isLoading ? (
              <Spinner />
            ) : subscription ? (
              `${subscriptionPrice}/${subscription?.prices?.interval}`
            ) : (
              <NextLink href="/pricing" passHref>
                <Button as="a" variant="solid">
                  Choose your plan
                </Button>
              </NextLink>
            )}
          </Box>
        </Card>
        <Card title="Your Email">
          <Text as="i">{user ? user.email : undefined}</Text>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
