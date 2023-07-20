import { Flex, Heading, Text } from "@chakra-ui/react";
import { GetStaticPropsResult } from "next";
import Image from "next/image";

import barreGif from "../public/images/barre.gif";
import editColorsGif from "../public/images/edit-colors.gif";
import editShapesGif from "../public/images/edit-shapes.gif";
import editTextGif from "../public/images/edit-text.gif";
import labelsGif from "../public/images/labels.gif";
import samplechordGif from "../public/images/samplechord.png";
import silentstringsGif from "../public/images/silentstrings.gif";
import toggleGif from "../public/images/toggle.gif";
import { T, useT } from "@magic-translate/react";

interface Props {
  title: string;
  description: string;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return {
    props: {
      title: "Help",
      description:
        "Learn how to create guitar chord diagrams with ChordPic. Don't worry, it's super easy!",
    },
  };
}

const HelpPage = () => {
  const t = useT();

  return (
    <>
      <Heading size="2xl" mb={6}>
        <T>Help</T>
      </Heading>
      <Text mb={3}>
        <T>
          If you haven&apos;t figured it out already, here&apos;s how you create
          a chord chart and then save it as a PNG or SVG image. Don&apos;t
          worry, it&apos;s super simple!
        </T>
      </Text>
      <Text mb={3}>
        <T>
          ChordPic has 3 main sections: The <em>Editor</em>, the <em>Result</em>{" "}
          and the <em>Download and Share</em> section.
        </T>
      </Text>
      <Text mb={3}>
        <T>
          As the name suggests, in the editor section you edit you chord chart.
          Every change of the chord chart is done in this section! More on this
          section later.
        </T>
      </Text>
      <Text mb={3}>
        <T>In the Result section you can see a preview of your chord chart.</T>
      </Text>
      <Text mb={3}>
        <T>
          The download and share section allows you to download your chart in
          different formats and sharing the charts on different platforms.
        </T>
      </Text>
      <Heading size="lg" mb={3} id="the-editor">
        <T>The Editor</T>
      </Heading>
      <Text mb={3}>
        <T>
          <strong>Adding / removing fingers</strong>: Simply click anywhere you
          want the finger to appear. To remove the finger, just click on it
          again and it will disappear.
        </T>
      </Text>
      <Flex justifyContent="center">
        <Image
          src={toggleGif}
          alt={t("Example of adding and removing fingers")}
        />
      </Flex>
      <Text mb={3}>
        <T>
          <strong>Toggling silent or open strings</strong>: If there is no
          finger on a string, an &apos;O&apos; automatically appears above the
          string (open string). If you want to change that to an &apos;X&apos;
          (don&apos;t play that string) simply click on the &apos;O&apos; to
          make it an &apos;X&apos;. When you click it again it will change back
          to an &apos;O&apos;.
        </T>
      </Text>
      <Flex justifyContent="center">
        <Image
          src={silentstringsGif}
          alt={t("Example of toggling strings from do not play to open")}
        />
      </Flex>
      <Text mb={3}>
        <T>
          <strong>Adding a barre chord</strong>: To add a barre chord, you can
          simply connect the strings with the mouse or if you&apos;re on mobile
          you can swipe from one string to another with your finger. To remove
          the bare chord simply click anywhere on the fret with the barre chord
          to remove it.
        </T>
      </Text>
      <Flex justifyContent="center">
        <Image
          src={barreGif}
          alt={t("Example of adding and removing a barre chord")}
        />
      </Flex>
      <Text mb={3}>
        <T>
          <strong>Adding labels to fingers and barre chords</strong>: To add
          text to any finger or barre chords, first click the &quot;Edit
          Text&quot; button at the bottom of the editor to reveal a text field
          on top of each finger and barre chord. You can now simply add or edit
          any text on each finger or barre chord. When you&apos;re done you can
          click on the &quot;Edit Notes&quot; button to continue editing the
          notes.
        </T>
      </Text>
      <Flex justifyContent="center">
        <Image
          src={editTextGif}
          alt={t(
            "Example of adding and editing text on fingers and barre chords",
          )}
        />
      </Flex>
      <Text mb={3}>
        <T>
          <strong>Changing colors of fingers and barre chords</strong>: Changing
          colors of fingers and barre chords works just like editing text. After
          you added your fingers and barre chords click on the &quot;Edit
          Colors&quot; button at the bottom of the editor section. After that,
          click on any finger or barre chord to reveal a color picker where you
          can pick your desired color.
        </T>
      </Text>
      <Flex justifyContent="center">
        <Image
          src={editColorsGif}
          alt={t(
            "Example of adding and editing text on fingers and barre chords",
          )}
        />
      </Flex>
      <Text mb={3}>
        <T>
          <strong>Changing the shapes of fingers</strong>: After you added your
          fingers to the fret board click the &quot;Edit Shapes&quot; button at
          the bottom of the editor section. After that, click on any finger to
          change its shape. To revert the shape to a circle, keep clicking the
          finger until the shape is a circle again.
        </T>
      </Text>
      <Flex justifyContent="center">
        <Image
          src={editShapesGif}
          alt={t("Example of changing the shape of a finger")}
        />
      </Flex>
      <Text mb={3}>
        <T>
          <strong>Adding labels to strings</strong>: To label the strings you
          can enter any letters or numbers below the strings. By default the
          strings are not labelled.
        </T>
      </Text>

      <Flex justifyContent="center">
        <Image
          src={labelsGif}
          alt={t("Example of adding and removing a barre chord")}
        />
      </Flex>
      <Heading size="lg" mb={3} id="the-result-section">
        <T>The Result Section</T>
      </Heading>
      <Text mb={3}>
        <T>
          The result section gives you a preview of what your chart image will
          look like. All changes made in the editor section are immediately
          visible in the result section. Sample chart:
        </T>
      </Text>
      <Flex justifyContent="center">
        <Image src={samplechordGif} alt={t("Example chord chart")} />
      </Flex>
      <Heading size="lg" mb={3} id="the-download-sharing-section">
        <T>The Download &amp; Sharing Section</T>
      </Heading>
      <Text mb={3}>
        <T>
          In the download section you can download your chord chart as an image.
          You can export the image as an SVG or PNG image. When you download a
          PNG image, you have to chose between different resolutions. The height
          of the images can vary and depend on what your chart looks like. The
          width will always stay the same though, no matter what your chart
          looks like.
        </T>
      </Text>
      <Text mb={3}>
        <T>
          In the share section you can generate a link that you can share with
          other people. All your settings and the whole chart are saved{" "}
          <em>in that link</em>. The sharing section also allows you to share
          your charts on many different platforms or messengers.
        </T>
      </Text>
    </>
  );
};

export default HelpPage;
