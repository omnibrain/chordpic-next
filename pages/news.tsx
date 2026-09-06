import Image from "next/image";

import barreAndFingerSameFret from "../public/images/barre-and-finger-same-fret.png";
import exampleHorizontalChord from "../public/images/example-horizontal-chord.png";
import sampleChordWithColors from "../public/images/sample-chord-with-colors.png";
import orientationToggle from "../public/images/orientation-toggle.png";
import sampleChordWithText from "../public/images/sample-chord-with-text.png";
import fretMarkers from "../public/images/fret-markers.png";

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
    <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-heading prose-a:underline-offset-4">
      <h1>
        <T>News</T>
      </h1>
      <p>
        <T>
          Read about new features, ideas, and success stories of guitar players
          around the world using ChordPic to create chord diagram images.
        </T>
      </p>
      <p>
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
      </p>

      <h2 id="customize-open-and-silent-strings">
        <T>More options for open and silent strings!</T>
      </h2>
      <p>
        <em>
          <T>September 6th, 2026</T>
        </em>
      </p>
      <p>
        <T>
          You can now add text and custom colors to the O and X markers above
          the fretboard! Just use &quot;Edit Text&quot; or &quot;Edit Colors&quot;
          to label note names or highlight an open string, just like you do
          with fretted notes.
        </T>
      </p>
      <p>
        <T>
          Want to leave a marker out? In &quot;Edit Fingers&quot; mode, click it
          to cycle through open, silent, and hidden. Handy for scale diagrams!
        </T>
      </p>
      <p>
        <T>
          This feature was requested by a user. Feature requests are always
          welcome, so don&apos;t hesitate to{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>{" "}
          with your ideas!
        </T>
      </p>

      <h2 id="a-fresh-new-look">
        <T>A fresh new look for ChordPic ✨</T>
      </h2>
      <p>
        <em>
          <T>August 3rd, 2026</T>
        </em>
      </p>
      <p>
        <T>
          ChordPic just got a redesign! You&apos;ll notice a cleaner layout, a
          new typeface, and a generally tidier feel across the whole site. The
          chord editor you know and love works exactly the same as before,
          we&apos;ve just given the surroundings a good polish.
        </T>{" "}
      </p>
      <p>
        <T>
          As always, if you run into anything that looks off or you have
          thoughts on the new design, don&apos;t hesitate to{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>
          !
        </T>{" "}
      </p>

      <h2 id="change-font-size-of-title">
        <T>Fret markers!</T>
      </h2>
      <p>
        <em>
          <T>January 27th, 2025</T>
        </em>
      </p>
      <p>
        <T>
          It&apos;s been a long time since a new feature dropped for ChordPic
          but today is the day! You can now add fret markers to your chord
          diagrams. Just click on the &quot;More Settings&quot; toggle and you
          will find a new checkbox to add fret markers to your chord diagrams.
        </T>{" "}
      </p>
      <p>
        <T>The fret markers look like this:</T>{" "}
      </p>
      <div className="flex justify-center">
        <Image src={fretMarkers} alt={t("Chord diagram with fret markers")} />
      </div>
      <p>
        <T>
          Notice the little dot in the center? That&apos;s a fret marker. If you
          add more frets, the dots will automatically appear on the frets
          further down the fretboard.{" "}
        </T>{" "}
      </p>
      <p>
        <T>
          This feature was requested by a user. What would <strong>you</strong>{" "}
          like to see next? We&apos;re always looking for feedback, so
          don&apos;t hesitate to{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>{" "}
          with your feature request!
        </T>{" "}
      </p>

      <h2 id="change-font-size-of-title">
        <T>You can now change the font size of the title</T>
      </h2>
      <p>
        <em>
          <T>August 21st, 2023</T>
        </em>
      </p>
      <p>
        <T>
          It&apos;s now possible to change the font size of the chord&apos;s
          titles. Another feature that has been requested multiple times is now
          implemented and available for all users, Free and Pro.
        </T>{" "}
      </p>

      <h2 id="you-can-now-create-horizontal-chord-diagrams-">
        <T>ChordPic is now available in 8 languages</T>
      </h2>
      <p>
        <em>
          <T>July 19th, 2023</T>
        </em>
      </p>
      <p>
        <T>
          ChordPic is now available for an even broader audience. From today,
          ChordPic is available in the following languages: English, Spanish
          Portuguese, Italian, Chinese, French, Russian, and German.
        </T>{" "}
        <Link href="/languages" style={{ textDecoration: "underline" }}>
          <T>Choose your language here.</T>
        </Link>
      </p>
      <p>
        <T>
          These translations are provided by an amazing tool called Magic
          Translate. If you&apos;re a website owner or developer yourself, I
          highly recommend checking out Magic Translate at
          <a
            href="https://magictranslate.io"
            style={{ textDecoration: "underline" }}
          >
            https://magictranslate.io
          </a>
          .
        </T>
      </p>

      <h2 id="you-can-now-create-horizontal-chord-diagrams-">
        <T>Sliders now show numerical values</T>
      </h2>
      <p>
        <em>
          <T>November 16th, 2022</T>
        </em>
      </p>
      <p>
        <T>
          A small improvement that makes it easier to see the exact values of
          the sliders in the chord settings: Now the sliders show the numerical
          value of the setting they control.
        </T>
      </p>
      <p>
        <T>Here&apos;s what this looks like in action:</T>
      </p>
      <div className="flex justify-center">
        <Image src={sliders} alt={t("Sliders with numerical values")} />
      </div>
      <p>
        <T>
          This makes it much easier to rember your settings so you can create
          chord diagrams with the exact same settings on a different machine.
        </T>
      </p>

      <h2 id="you-can-now-create-horizontal-chord-diagrams-">
        <T>Position can now be hidden</T>
      </h2>
      <p>
        <em>
          <T>October 29th, 2022</T>
        </em>
      </p>
      <p>
        <T>
          Another user request has been implemented: You can now hide the
          position of a chord. Just check the &apos;Hide position&apos;
          checkmark.
        </T>
      </p>
      <p>
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
      </p>

      <h2 id="you-can-now-create-horizontal-chord-diagrams-">
        <T>Font size of fingers can now be adjusted</T>
      </h2>
      <p>
        <em>
          <T>October 19th, 2022</T>
        </em>
      </p>
      <p>
        <T>
          Yet another way to customize your chord diagrams! Under the &quot;More
          Settings&quot; toggle you will now find a slider to adjust the text
          size of the text inside fingers and barres.
        </T>
      </p>
      <p>
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
      </p>

      <h2 id="you-can-now-create-horizontal-chord-diagrams-">
        <T>OMG, what&apos;s happening with ChordPic?</T>
      </h2>
      <p>
        <em>
          <T>October 16th, 2022</T>
        </em>
      </p>
      <p>
        <T>
          If you have used ChordPic before, you may have noticed that things
          have changed a litlle around here. First of all, ChordPic has an all
          new look! And second, there are a couple new links on top, and an all
          new <strong>dark mode</strong> 😱 🤯
        </T>
      </p>
      <p>
        <T>
          The ChordPic that you know and love is still here and works almost
          exactly the same as before, but now there&apos;s a way to create an
          account and get a ChordPic Pro subscription. The ChordPic Pro
          subscription gives you access to:
        </T>
      </p>
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

      <p>
        <T>
          The ChordPic Pro subscription is not a way for us to get rich, but our
          hope is that at some point enough people have a Pro subscription so
          that we can spend more time on this tool and introduce new cool
          features.
        </T>
      </p>
      <p>
        <T>
          The indroduction of a user login and an actual backend opens up a wide
          range of new possibliities for ChordPic and we would love to spend
          time to explore these possibilities.
        </T>
      </p>

      <p>
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
      </p>

      <h2 id="you-can-now-create-horizontal-chord-diagrams-">
        <T>You can now create horizontal chord diagrams 😮</T>
      </h2>
      <p>
        <em>
          <T>January 15th, 2022</T>
        </em>
      </p>
      <p>
        <T>
          There is now a new setting hidden under the &quot;More Settings&quot;
          toggle that allows you to create horizontal chord diagrams.
        </T>
      </p>
      <div className="flex justify-center">
        <Image src={orientationToggle} alt="Example horizontal chord" />
      </div>
      <p>
        <T>
          The setting is called &quot;Orientation&quot; and you can chose
          between &quot;Horizontal&quot; and &quot;Vertical&quot;. Give it a try
          and see which orientation suit your needs best!
        </T>
      </p>
      <p>
        <T>Here&apos;s an example of a horizontal chord diagram:</T>
      </p>
      <div className="flex justify-center">
        <Image
          src={exampleHorizontalChord}
          alt={t("Example horizontal chord")}
        />
      </div>
      <h2 id="barre-chords-on-firefox-fixed-">
        <T>Barre Chords on Firefox Fixed!</T>
      </h2>
      <p>
        <em>
          <T>December 13th, 2020</T>
        </em>
      </p>
      <p>
        <T>
          If you ever wondered why you couldn&apos;t draw barre chords on
          Firefox: Wonder no longer! That was a very old bug that has finally
          been fixed.
        </T>
      </p>
      <h2 id="new-shapes-for-fingers-">
        <T>New Shapes for Fingers!</T>
      </h2>
      <p>
        <em>
          <T>December 12th, 2020</T>
        </em>
      </p>
      <p>
        <T>
          It&apos;s been quite a while since the last new feature was released
          for ChordPic. Which is why we&apos;re even more excited to release
          this one: You can now change the shapes of fingers 😮! You can choose
          your notes to be triangles, squares, circles, and pentagons. Give it a
          shot, it&apos;s super easy! Just click the &quot;Edit Shapes&quot;
          button and click on the notes, and you will circle through the
          different shapes.
        </T>
      </p>
      <h2 id="chordpic-firefox-">
        <T>ChordPic + Firefox = ❤️</T>
      </h2>
      <p>
        <em>
          <T>October 3rd, 2020</T>
        </em>
      </p>
      <p>
        <T>
          ChordPic has been updated to work with Firefox! Before this update it
          wasn&apos;t possible to download the diagrams as PNGs on Firefox.
        </T>
      </p>
      <p>
        <T>
          Another, unrelated update: Whn you download your diagram as SVG the
          SVG file name will now be the diagrams title. This was already the
          case for PNG images.
        </T>
      </p>
      <h2 id="chordpic-featured-by-youtuber-cesar-all-guitar">
        <T>ChordPic featured by YouTuber Cesar All Guitar</T>
      </h2>
      <p>
        <em>
          <T>July 27th, 2020</T>
        </em>
      </p>
      <p>
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
      </p>
      <h2 id="changing-colors-of-fingers-and-barre-chords">
        <T>Changing Colors of Fingers and Barre Chords</T>
      </h2>
      <p>
        <em>
          <T>June 20th, 2020</T>
        </em>
      </p>
      <p>
        <T>
          Another requested feature is now ready to use: Changing the color of
          individual fingers and barre chords! Just like adding text you can
          click on the &quot;Edit Colors&quot; button and then click on a finger
          or a barre chord to reveal a color picker where you can pick a color
          for the finger or barre chord that you selected. As easy as that!
          Here&apos;s an example:
        </T>
      </p>
      <div className="flex justify-center">
        <Image
          src={sampleChordWithColors}
          alt={t("Example chord with colors")}
        />
      </div>
      <p>
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
      </p>
      <h2 id="adding-text-to-fingers-and-barre-chords">
        <T>Adding Text to Fingers and Barre Chords</T>
      </h2>
      <p>
        <em>
          <T>June 6th, 2020</T>
        </em>
      </p>
      <p>
        <T>
          The probably most requested feature is now finally here: Each finger
          and barre chord can now be labelled! You can now add arbitrary text to
          each nut and each barre chord. Here&apos;s an example:
        </T>
      </p>
      <div className="flex justify-center">
        <Image
          width={4}
          src={sampleChordWithText}
          alt={t("Example chord with text")}
        />
      </div>
      <p>
        <T>
          It&apos;s really easy too. Just click on the &quot;Edit Text&quot;
          button at the bottom of the chord editor and start labelling your
          fingers and barre chords.
        </T>
      </p>
      <p>
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
      </p>
      <h2 id="improved-chord-logic">
        <T>Improved Chord Logic</T>
      </h2>
      <p>
        <em>
          <T>May 2nd, 2020</T>
        </em>
      </p>
      <p>
        <T>
          Multiple users of ChordPic have reported that it was not possible to
          create a chord diagram with a barre chart and a finger on the same
          fret. This is now fixed! You can now create chord diagrams like this:
        </T>
      </p>
      <div className="flex justify-center">
        <Image src={barreAndFingerSameFret} alt={t("Example chord chart")} />
      </div>
      <p>
        <T>Special thanks to everyone that reported this issue.</T>
      </p>
      <p>
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
      </p>
      <h2 id="how-it-all-started">
        <T>How it all started</T>
      </h2>
      <p>
        <em>
          <T>May 2nd, 2020</T>
        </em>
      </p>
      <p>
        <T>
          ChordPic was created after its predecessor, Chordpix, suddenly went
          offline and left guitar players around the world hanging. After
          Jonathan Eli, my friend and brilliant guitar player, told me about
          this I immediately started implementing a replacement. It has been a
          fun side project ever since, and I&apos;m looking forward to
          continuing improving this tool for all guitar players.
        </T>
      </p>
      <p>
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
      </p>
    </article>
  );
};

export default HelpPage;
