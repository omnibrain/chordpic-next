import Image from "next/image";

import barreAndFingerSameFret from "../public/images/barre-and-finger-same-fret.png";
import exampleHorizontalChord from "../public/images/example-horizontal-chord.png";
import sampleChordWithColors from "../public/images/sample-chord-with-colors.png";
import orientationToggle from "../public/images/orientation-toggle.png";
import sampleChordWithText from "../public/images/sample-chord-with-text.png";
import { Center, Heading, Text } from "@chakra-ui/react";
import { GetStaticPropsResult } from "next";

import sliders from "../assets/images/sliders.jpg";
import { T, useT } from "@magic-translate/react";
import React from "react";
import Link from "next/link";

interface Props {
  title: string;
  description: string;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return {
    props: {
      title: "News",
      description:
        "News about ChordPic, the free guitar chord diagram creator. Learn about new features and updates.",
    },
  };
}

const HelpPage = () => {
  const t = useT();

  return (
    <>
      <Heading size="2xl" mb={6} as="h1">
        <T>News</T>
      </Heading>
      <Text mb={3} fontSize="lg">
        <T>
          Read about new features, ideas, and success stories of guitar players
          around the world using ChordPic to create chord diagram images.
        </T>
      </Text>
      <Text mb={3} fontSize="lg">
        <T>
          Are you using ChordPic for your website, book, YouTube channel or in
          any other way? Please{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>
          , we would love to hear your story and tell other people about it!
        </T>
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        <T>ChordPic is now available in 8 languages</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>July 19th, 2023</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          ChordPic is now available for an even broader audience. From today,
          ChordPic is available in the following languages: English, Spanish
          Portuguese, Italian, Chinese, French, Russian, and German.
        </T>{" "}
        <Link href="/languages" style={{ textDecoration: "underline" }}>
          <T>Choose your language here.</T>
        </Link>
      </Text>
      <Text mb={3}>
        <T>
          These translations are provided by an amazing tool called Magic
          Translate. If you're a website owner or developer yourself, I highly
          recommend checking out Magic Translate at
          <a
            href="https://magictranslate.io"
            style={{ textDecoration: "underline" }}
          >
            https://magictranslate.io
          </a>
          .
        </T>
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        <T>Sliders now show numerical values</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>November 16th, 2022</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          A small improvement that makes it easier to see the exact values of
          the sliders in the chord settings: Now the sliders show the numerical
          value of the setting they control.
        </T>
      </Text>
      <Text mb={3}>
        <T>Here&apos;s what this looks like in action:</T>
      </Text>
      <Center>
        <Image src={sliders} alt={t("Sliders with numerical values")} />
      </Center>
      <Text mb={3}>
        <T>
          This makes it much easier to rember your settings so you can create
          chord diagrams with the exact same settings on a different machine.
        </T>
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        <T>Position can now be hidden</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>October 29th, 2022</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          Another user request has been implemented: You can now hide the
          position of a chord. Just check the &apos;Hide position&apos;
          checkmark.
        </T>
      </Text>
      <Text mb={3}>
        <T>What feature would you like to see?</T>{" "}
        <T>
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            Write us an email
          </a>{" "}
          with your feature request!
        </T>
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        <T>Font size of fingers can now be adjusted</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>October 19th, 2022</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          Yet another way to customize your chord diagrams! Under the &quot;More
          Settings&quot; toggle you will now find a slider to adjust the text
          size of the text inside fingers and barres.
        </T>
      </Text>
      <Text mb={3}>
        <T>
          This feature was requested by a user. What would <strong>you</strong>{" "}
          like to adjust? We&apos;re always looking for feedback, so don&apos;t
          hesitate to{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>{" "}
          with your feature request.
        </T>
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        <T>OMG, what&apos;s happening with ChordPic?</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>October 16th, 2022</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          If you have used ChordPic before, you may have noticed that things
          have changed a litlle around here. First of all, ChordPic has an all
          new look! And second, there are a couple new links on top, and an all
          new <strong>dark mode</strong> 😱 🤯
        </T>
      </Text>
      <Text mb={3}>
        <T>
          The ChordPic that you know and love is still here and works almost
          exactly the same as before, but now there&apos;s a way to create an
          account and get a ChordPic Pro subscription. The ChordPic Pro
          subscription gives you access to:
        </T>
      </Text>
      <T>
        <ul style={{ marginBottom: "1rem" }}>
          <li>A completely ad free experience</li>
          <li>
            Chord diagrams without the &quot;created with chordpic.com&quot;
            watermark
          </li>
          <li>Chord diagrams in hand-drawn style</li>
        </ul>
      </T>

      <Text mb={3}>
        <T>
          The ChordPic Pro subscription is not a way for us to get rich, but our
          hope is that at some point enough people have a Pro subscription so
          that we can spend more time on this tool and introduce new cool
          features.
        </T>
      </Text>
      <Text mb={3}>
        <T>
          The indroduction of a user login and an actual backend opens up a wide
          range of new possibliities for ChordPic and we would love to spend
          time to explore these possibilities.
        </T>
      </Text>

      <Text mb={3}>
        <T>
          We hope you like this re-build of ChordPic. If you have any feature
          suggestions, bug reports, or general feelings about the site,
          don&apos;t hesitate to{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>
          .
        </T>
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        <T>You can now create horizontal chord diagrams 😮</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>January 15th, 2022</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          There is now a new setting hidden under the &quot;More Settings&quot;
          toggle that allows you to create horizontal chord diagrams.
        </T>
      </Text>
      <Center mb={3}>
        <Image src={orientationToggle} alt="Example horizontal chord" />
      </Center>
      <Text mb={3}>
        <T>
          The setting is called &quot;Orientation&quot; and you can chose
          between &quot;Horizontal&quot; and &quot;Vertical&quot;. Give it a try
          and see which orientation suit your needs best!
        </T>
      </Text>
      <Text mb={3}>
        <T>Here&apos;s an example of a horizontal chord diagram:</T>
      </Text>
      <Center mb={3}>
        <Image
          src={exampleHorizontalChord}
          alt={t("Example horizontal chord")}
        />
      </Center>
      <Heading size="lg" mb={3} mt={8} id="barre-chords-on-firefox-fixed-">
        <T>Barre Chords on Firefox Fixed!</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>December 13th, 2020</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          If you ever wondered why you couldn&apos;t draw barre chords on
          Firefox: Wonder no longer! That was a very old bug that has finally
          been fixed.
        </T>
      </Text>
      <Heading size="lg" mb={3} mt={8} id="new-shapes-for-fingers-">
        <T>New Shapes for Fingers!</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>December 12th, 2020</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          It&apos;s been quite a while since the last new feature was released
          for ChordPic. Which is why we&apos;re even more excited to release
          this one: You can now change the shapes of fingers 😮! You can choose
          your notes to be triangles, squares, circles, and pentagons. Give it a
          shot, it&apos;s super easy! Just click the &quot;Edit Shapes&quot;
          button and click on the notes, and you will circle through the
          different shapes.
        </T>
      </Text>
      <Heading size="lg" mb={3} mt={8} id="chordpic-firefox-">
        <T>ChordPic + Firefox = ❤️</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>October 3rd, 2020</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          ChordPic has been updated to work with Firefox! Before this update it
          wasn&apos;t possible to download the diagrams as PNGs on Firefox.
        </T>
      </Text>
      <Text mb={3}>
        <T>
          Another, unrelated update: Whn you download your diagram as SVG the
          SVG file name will now be the diagrams title. This was already the
          case for PNG images.
        </T>
      </Text>
      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="chordpic-featured-by-youtuber-cesar-all-guitar"
      >
        <T>ChordPic featured by YouTuber Cesar All Guitar</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>July 27th, 2020</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          ChordPic has been featured in a video by the fantastic YouTuber{" "}
          <em>Cesar All Guitar</em>.
          <a
            href="https://youtu.be/_pu4vOEdpwM"
            style={{ textDecoration: "underline" }}
          >
            Check out the video on YouTube
          </a>{" "}
          and also{" "}
          <a
            href="https://www.youtube.com/channel/UCBocQ9yt6k7NdFD1yaHF_ZQ"
            style={{ textDecoration: "underline" }}
          >
            check out Cesar&apos;s YouTube channel
          </a>{" "}
          for more great guitar related content!
        </T>
      </Text>
      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="changing-colors-of-fingers-and-barre-chords"
      >
        <T>Changing Colors of Fingers and Barre Chords</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>June 20th, 2020</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          Another requested feature is now ready to use: Changing the color of
          individual fingers and barre chords! Just like adding text you can
          click on the &quot;Edit Colors&quot; button and then click on a finger
          or a barre chord to reveal a color picker where you can pick a color
          for the finger or barre chord that you selected. As easy as that!
          Here&apos;s an example:
        </T>
      </Text>
      <Center mb={3}>
        <Image
          src={sampleChordWithColors}
          alt={t("Example chord with colors")}
        />
      </Center>
      <Text mb={3}>
        <T>
          Have you found a bug or do you have an idea how to make this feature
          even better? Don&apos;t hesitate to
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>
          !
        </T>
      </Text>
      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="adding-text-to-fingers-and-barre-chords"
      >
        <T>Adding Text to Fingers and Barre Chords</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>June 6th, 2020</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          The probably most requested feature is now finally here: Each finger
          and barre chord can now be labelled! You can now add arbitrary text to
          each nut and each barre chord. Here&apos;s an example:
        </T>
      </Text>
      <Center mb={3}>
        <Image src={sampleChordWithText} alt={t("Example chord with text")} />
      </Center>
      <Text mb={3}>
        <T>
          It&apos;s really easy too. Just click on the &quot;Edit Text&quot;
          button at the bottom of the chord editor and start labelling your
          fingers and barre chords.
        </T>
      </Text>
      <Text mb={3}>
        <T>
          As always, if you have any suggestion how to make this feature even
          better or if you experience any problems with this new feature please{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>
          !
        </T>
      </Text>
      <Heading size="lg" mb={3} mt={8} id="improved-chord-logic">
        <T>Improved Chord Logic</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>May 2nd, 2020</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          Multiple users of ChordPic have reported that it was not possible to
          create a chord diagram with a barre chart and a finger on the same
          fret. This is now fixed! You can now create chord diagrams like this:
        </T>
      </Text>
      <Center mb={3}>
        <Image src={barreAndFingerSameFret} alt={t("Example chord chart")} />
      </Center>
      <Text mb={3}>
        <T>Special thanks to everyone that reported this issue.</T>
      </Text>
      <Text mb={3}>
        <T>
          Have you found a bug or do you have a feature request? Don&apos;t
          hesitate to
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>
          . Together we will improve ChordPic to make it the best chord diagram
          creator out there!
        </T>
      </Text>
      <Heading size="lg" mb={3} mt={8} id="how-it-all-started">
        <T>How it all started</T>
      </Heading>
      <Text mb={3}>
        <em>
          <T>May 2nd, 2020</T>
        </em>
      </Text>
      <Text mb={3}>
        <T>
          ChordPic was created after its predecessor, Chordpix, suddenly went
          offline and left guitar players around the world hanging. After
          Jonathan Eli, my friend and brilliant guitar player, told me about
          this I immediately started implementing a replacement. It has been a
          fun side project ever since, and I&apos;m looking forward to
          continuing improving this tool for all guitar players.
        </T>
      </Text>
      <Text mb={3}>
        <T>
          Since the very early days of ChordPic, Jonathan Eli has been using the
          generated chord chart images for his unique educational YouTube
          channel. You should definitely{" "}
          <a
            href="https://www.youtube.com/channel/UChgJio8vi7Yn3UWZBOaCzWQ"
            style={{ textDecoration: "underline" }}
          >
            check out Jonathan Eli&apos;s YouTube channel
          </a>
          !
        </T>
      </Text>
    </>
  );
};

export default HelpPage;
