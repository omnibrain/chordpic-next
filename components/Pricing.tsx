import {
  Box,
  Center,
  Heading,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { ProductWithPrice } from "../types";
import { FreeProduct } from "./FreeProduct";
import { Product } from "./Product";

interface Props {
  products: ProductWithPrice[];
}

export default function Pricing({ products }: Props) {
  return (
    <Box as="section">
      <Heading as="h1" size="3xl" mb={4} textAlign="center">
        Pricing Plans
      </Heading>
      <Text fontSize="xl" textAlign="center" mb={12}>
        Start building for free. Go pro to unlock all features
      </Text>

      <Tabs variant="soft-rounded" colorScheme="green" align="center">
        <TabList>
          <Tab>Monthly billing</Tab>
          <Tab>Yearly billing</Tab>
        </TabList>
        <TabPanels>
          <TabPanel pt={12}>
            <SimpleGrid minChildWidth="18rem" spacing="1rem">
              <FreeProduct billingInterval="month" product={products[0]} />
              <Product billingInterval="month" product={products[0]} />
            </SimpleGrid>
          </TabPanel>
          <TabPanel pt={12}>
            <SimpleGrid minChildWidth="18rem" spacing="1rem">
              <FreeProduct billingInterval="year" product={products[0]} />
              <Product billingInterval="year" product={products[0]} />
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
