import {
  Badge,
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
import { T } from '@magic-translate/react'

interface Props {
  products: ProductWithPrice[];
}

export default function Pricing({ products }: Props) {
  return (
    <Box as="section">
      <Heading as="h1" size="3xl" mb={6} textAlign="center">
        <T>Pricing Plans</T>
      </Heading>
      <Text fontSize="xl" textAlign="center" mb={12}>
        <T>Start for free. Go <strong>Pro</strong> for chord diagrams{" "}
          <strong> without watermark</strong>, <strong>handdrawn style</strong>{" "}
          and <strong>no ads</strong>.</T>
      </Text>

      <Tabs variant="soft-rounded" colorScheme="green" align="center">
        <TabList>
          <Tab><T>Monthly billing</T></Tab>
        <Tab><T>Yearly billing</T></Tab>
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
