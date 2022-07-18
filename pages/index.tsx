import { Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import { Layout } from "../components/Layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <Heading>Guitar Chord Diagram Creator</Heading>
    </Layout>
  );
};

export default Home;
