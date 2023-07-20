import { Heading, List, ListItem, Text } from "@chakra-ui/react";
import { GetStaticPropsResult } from "next";
import { Language, T } from "@magic-translate/react";
import { languageMap } from "../utils/translate";
import Link from "next/link";
import { useRouter } from "next/router";
import { SUPPORT_EMAIL } from "../global";

interface Props {
  title: string;
  description: string;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return {
    props: {
      title: "Languages",
      description: "Chose your preferred ChordPic language",
    },
  };
}

const Languages = () => {
  const router = useRouter();

  return (
    <>
      <Heading size="2xl" mb={6}>
        <T>Languages</T>
      </Heading>
      <Text mb={4}>
        <T>ChordPic is currently available in the following languages:</T>
      </Text>

      <List
        display="grid"
        gridTemplateColumns={[null, "1fr 1fr 1fr"]}
        gridGap={[3, 4]}
      >
        {Object.entries(languageMap).map(([lang, { name, icon }]) => (
          <ListItem key={lang}>
            <Link
              href="/"
              locale={lang}
              style={{ textDecoration: "underline" }}
            >
              <T lang={lang as Language}>{name}</T>
            </Link>
          </ListItem>
        ))}
      </List>

      <Text mt={5}>
        <T>
          Missing a language? Thanks to{" "}
          <a
            href="https://magictranslate.io"
            style={{ textDecoration: "underline" }}
          >
            Magic Translate
          </a>{" "}
          we can instantly translate ChordPic instantly to any other language.
          Just{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>{" "}
          and let us know which language to add.
        </T>
      </Text>
    </>
  );
};

export default Languages;
