import Image from "next/image";

import barreAndFingerSameFret from "../public/images/barre-and-finger-same-fret.png";
import exampleHorizontalChord from "../public/images/example-horizontal-chord.png";
import sampleChordWithColors from "../public/images/sample-chord-with-colors.png";
import orientationToggle from "../public/images/orientation-toggle.png";
import sampleChordWithText from "../public/images/sample-chord-with-text.png";
import { Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { GetStaticPropsResult } from "next";

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
  return (
    <>
      <Heading size="2xl" mb={6} as="h1">
        News
      </Heading>
      <Text mb={3} fontSize="lg">
        Read about new features, ideas, and success stories of guitar players
        around the world using ChordPic to create chord diagram images.
      </Text>
      <Text mb={3} fontSize="lg">
        Are you using ChordPic for your website, book, YouTube channel or in any
        other way? Please{" "}
        <Link href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com">
          write us an email
        </Link>
        , we would love to hear your story and tell other people about it!
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        Position can now be hidden
      </Heading>
      <Text mb={3}>
        <em>October 29th, 2022</em>
      </Text>
      <Text mb={3}>
        Another user request has been implemented: You can now hide the position
        of a chord. Just check the &apos;Hide position&apos; checkmark.
      </Text>
      <Text mb={3}>
        What feature would you like to see?{" "}
        <Link href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com">
          Write us an email
        </Link>{" "}
        with your feature request!
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        Font size of fingers can now be adjusted
      </Heading>
      <Text mb={3}>
        <em>October 19th, 2022</em>
      </Text>
      <Text mb={3}>
        Yet another way to customize your chord diagrams! Under the &quot;More
        Settings&quot; toggle you will now find a slider to adjust the text size
        of the text inside fingers and barres.
      </Text>
      <Text mb={3}>
        This feature was requested by a user. What would <strong>you</strong>{" "}
        like to adjust? We&apos;re always looking for feedback, so don&apos;t
        hesitate to{" "}
        <Link href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com">
          write us an email
        </Link>{" "}
        with your feature request.
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        OMG, what&apos;s happening with ChordPic?
      </Heading>
      <Text mb={3}>
        <em>October 16th, 2022</em>
      </Text>
      <Text mb={3}>
        If you have used ChordPic before, you may have noticed that things have
        changed a litlle around here. First of all, ChordPic has an all new
        look! And second, there are a couple new links on top, and an all new{" "}
        <strong>dark mode</strong> 😱 🤯
      </Text>
      <Text mb={3}>
        The ChordPic that you know and love is still here and works almost
        exactly the same as before, but now there&apos;s a way to create an
        account and get a ChordPic Pro subscription. The ChordPic Pro
        subscription gives you access to:
      </Text>
      <UnorderedList mb={3}>
        <ListItem>A completely ad free experience</ListItem>
        <ListItem>
          Chord diagrams without the &quot;created with chordpic.com&quot;
          watermark
        </ListItem>
        <ListItem>Chord diagrams in hand-drawn style</ListItem>
      </UnorderedList>

      <Text mb={3}>
        The ChordPic Pro subscription is not a way for us to get rich, but our
        hope is that at some point enough people have a Pro subscription so that
        we can spend more time on this tool and introduce new cool features.
      </Text>
      <Text mb={3}>
        The indroduction of a user login and an actual backend opens up a wide
        range of new possibliities for ChordPic and we would love to spend time
        to explore these possibilities.
      </Text>

      <Text mb={3}>
        We hope you like this re-build of ChordPic. If you have any feature
        suggestions, bug reports, or general feelings about the site, don&apos;t
        hesitate to{" "}
        <Link href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com">
          write us an email
        </Link>
        .
      </Text>

      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="you-can-now-create-horizontal-chord-diagrams-"
      >
        You can now create horizontal chord diagrams 😮
      </Heading>
      <Text mb={3}>
        <em>January 15th, 2022</em>
      </Text>
      <Text mb={3}>
        There is now a new setting hidden under the &quot;More Settings&quot;
        toggle that allows you to create horizontal chord diagrams.
      </Text>
      <Text mb={3}>
        <Image src={orientationToggle} alt="Example horizontal chord" />
      </Text>
      <Text mb={3}>
        The setting is called &quot;Orientation&quot; and you can chose between
        &quot;Horizontal&quot; and &quot;Vertical&quot;. Give it a try and see
        which orientation suit your needs best!
      </Text>
      <Text mb={3}>Here&apos;s an example of a horizontal chord diagram:</Text>
      <Text mb={3}>
        <Image src={exampleHorizontalChord} alt="Example horizontal chord" />
      </Text>
      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="chordpic-is-now-an-affiliate-partner-of-fender-play-the-1-guitar-learing-app"
      >
        ChordPic is now an affiliate partner of Fender Play, the #1 guitar
        learing app
      </Heading>
      <Text mb={3}>
        <em>Novemver 13th, 2021</em>
      </Text>
      <Text mb={3}>
        It&apos;s a match made in heaven: Users of ChordPic can now get special
        offers from Fender Play and ChordPic gets a small cut of the
        subscription fees. If you want to learn how to play the guitar with the
        #1 guitar learing app AND support ChordPic, you should definitely get a{" "}
        <a href="https://prf.hn/click/camref:1101lfvVp/creativeref:1011l22176">
          Fender Play subscription here
        </a>
        . Includes 2 weeks of trying for free 🤩
      </Text>
      <Heading size="lg" mb={3} mt={8} id="barre-chords-on-firefox-fixed-">
        Barre Chords on Firefox Fixed!
      </Heading>
      <Text mb={3}>
        <em>December 13th, 2020</em>
      </Text>
      <Text mb={3}>
        If you ever wondered why you couldn&apos;t draw barre chords on Firefox:
        Wonder no longer! That was a very old bug that has finally been fixed.
      </Text>
      <Heading size="lg" mb={3} mt={8} id="new-shapes-for-fingers-">
        New Shapes for Fingers!
      </Heading>
      <Text mb={3}>
        <em>December 12th, 2020</em>
      </Text>
      <Text mb={3}>
        It&apos;s been quite a while since the last new feature was released for
        ChordPic. Which is why we&apos;re even more excited to release this one:
        You can now change the shapes of fingers 😮! You can choose your notes
        to be triangles, squares, circles, and pentagons. Give it a shot,
        it&apos;s super easy! Just click the &quot;Edit Shapes&quot; button and
        click on the notes, and you will circle through the different shapes.
      </Text>
      <Heading size="lg" mb={3} mt={8} id="chordpic-firefox-">
        ChordPic + Firefox = ❤️
      </Heading>
      <Text mb={3}>
        <em>October 3rd, 2020</em>
      </Text>
      <Text mb={3}>
        ChordPic has been updated to work with Firefox! Before this update it
        wasn&apos;t possible to download the diagrams as PNGs on Firefox.
      </Text>
      <Text mb={3}>
        Another, unrelated update: Whn you download your diagram as SVG the SVG
        file name will now be the diagrams title. This was already the case for
        PNG images.
      </Text>
      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="chordpic-featured-by-youtuber-cesar-all-guitar"
      >
        ChordPic featured by YouTuber Cesar All Guitar
      </Heading>
      <Text mb={3}>
        <em>July 27th, 2020</em>
      </Text>
      <Text mb={3}>
        ChordPic has been featured in a video by the fantastic YouTuber{" "}
        <em>Cesar All Guitar</em>.
        <a href="https://youtu.be/_pu4vOEdpwM">
          Check out the video on YouTube
        </a>{" "}
        and also{" "}
        <a href="https://www.youtube.com/channel/UCBocQ9yt6k7NdFD1yaHF_ZQ">
          check out Cesar&apos;s YouTube channel
        </a>{" "}
        for more great guitar related content!
      </Text>
      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="changing-colors-of-fingers-and-barre-chords"
      >
        Changing Colors of Fingers and Barre Chords
      </Heading>
      <Text mb={3}>
        <em>June 20th, 2020</em>
      </Text>
      <Text mb={3}>
        Another requested feature is now ready to use: Changing the color of
        individual fingers and barre chords! Just like adding text you can click
        on the &quot;Edit Colors&quot; button and then click on a finger or a
        barre chord to reveal a color picker where you can pick a color for the
        finger or barre chord that you selected. As easy as that! Here&apos;s an
        example:
      </Text>
      <Text mb={3}>
        <Image src={sampleChordWithColors} alt="Example chord with colors" />
      </Text>
      <Text mb={3}>
        Have you found a bug or do you have an idea how to make this feature
        even better? Don&apos;t hesitate to
        <a href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com">
          write us an email
        </a>
        !
      </Text>
      <Heading
        size="lg"
        mb={3}
        mt={8}
        id="adding-text-to-fingers-and-barre-chords"
      >
        Adding Text to Fingers and Barre Chords
      </Heading>
      <Text mb={3}>
        <em>June 6th, 2020</em>
      </Text>
      <Text mb={3}>
        The probably most requested feature is now finally here: Each finger and
        barre chord can now be labelled! You can now add arbitrary text to each
        nut and each barre chord. Here&apos;s an example:
      </Text>
      <Text mb={3}>
        <Image src={sampleChordWithText} alt="Example chord with text" />
      </Text>
      <Text mb={3}>
        It&apos;s really easy too. Just click on the &quot;Edit Text&quot;
        button at the bottom of the chord editor and start labelling your
        fingers and barre chords.
      </Text>
      <Text mb={3}>
        As always, if you have any suggestion how to make this feature even
        better or if you experience any problems with this new feature please{" "}
        <a href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com">
          write us an email
        </a>
        !
      </Text>
      <Heading size="lg" mb={3} mt={8} id="improved-chord-logic">
        Improved Chord Logic
      </Heading>
      <Text mb={3}>
        <em>May 2nd, 2020</em>
      </Text>
      <Text mb={3}>
        Multiple users of ChordPic have reported that it was not possible to
        create a chord diagram with a barre chart and a finger on the same fret.
        This is now fixed! You can now create chord diagrams like this:
      </Text>
      <Text mb={3}>
        <Image src={barreAndFingerSameFret} alt="Example chord chart" />
      </Text>
      <Text mb={3}>Special thanks to everyone that reported this issue.</Text>
      <Text mb={3}>
        Have you found a bug or do you have a feature request? Don&apos;t
        hesitate to
        <a href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com">
          write us an email
        </a>
        . Together we will improve ChordPic to make it the best chord diagram
        creator out there!
      </Text>
      <Heading size="lg" mb={3} mt={8} id="how-it-all-started">
        How it all started
      </Heading>
      <Text mb={3}>
        <em>May 2nd, 2020</em>
      </Text>
      <Text mb={3}>
        ChordPic was created after its predecessor, Chordpix, suddenly went
        offline and left guitar players around the world hanging. After Jonathan
        Eli, my friend and brilliant guitar player, told me about this I
        immediately started implementing a replacement. It has been a fun side
        project ever since, and I&apos;m looking forward to continuing improving
        this tool for all guitar players.
      </Text>
      <Text mb={3}>
        Since the very early days of ChordPic, Jonathan Eli has been using the
        generated chord chart images for his unique educational YouTube channel.
        You should definitely
        <a href="https://www.youtube.com/channel/UChgJio8vi7Yn3UWZBOaCzWQ">
          check out Jonathan Eli&apos;s YouTube channel
        </a>
        !
      </Text>
    </>
  );
};

export default HelpPage;
