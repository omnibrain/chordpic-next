import { useEffect, useMemo, useRef, useState } from "react";
import { FaTelegram, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { MdFacebook, MdShare, MdEmail } from "react-icons/md";
import {
  EmailShareButton,
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import { Chart } from "../domain/chart";
import { getLink } from "../hooks/url-state";
import { GA } from "../services/google-analytics";
import { T } from "@magic-translate/react";
import { Button, buttonClasses } from "./ui/Button";
import { Input } from "./ui/Input";

interface IProps {
  chart: Chart;
}

export const ShareButtons = ({ chart }: IProps) => {
  const [link, setLink] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chartJson = useMemo(() => JSON.stringify(chart), [chart]);

  useEffect(() => {
    setLink(null);
  }, [chartJson]);

  function share() {
    GA()?.("event", "generate_share_link");
    const url = getLink(chart, "/chord");

    setLink(url);

    return new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  }

  const title = `ChordPic.com | ${chart.settings.title || "Unnamed Chord"}`;

  const copyLink = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand("copy");
    }
  };

  const shareButtonClass = buttonClasses("outline", "sm");

  return (
    <div className="mt-8" id="share">
      <h2 className="mb-3 font-heading text-2xl font-semibold tracking-tight">
        <T>Share</T>
      </h2>
      <Button variant="outline" onClick={share}>
        <MdShare />
        <T>Generate Sharing Link</T>
      </Button>

      {link && (
        <>
          <div className="relative mt-3">
            <Input
              ref={inputRef}
              className="pr-20"
              aria-label="Sharing Link"
              readOnly={true}
              value={link}
              type="text"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1 h-8"
              onClick={copyLink}
            >
              <T>Copy</T>
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <FacebookShareButton url={link}>
              <span className={shareButtonClass}>
                <MdFacebook />
                Facebook
              </span>
            </FacebookShareButton>

            <TelegramShareButton url={link} title={title}>
              <span className={shareButtonClass}>
                <FaTelegram />
                Telegram
              </span>
            </TelegramShareButton>

            <TwitterShareButton
              url={link}
              title={title}
              via="https://chordpic.com"
              hashtags={["guitar", "chord"]}
            >
              <span className={shareButtonClass}>
                <FaTwitter />
                Twitter
              </span>
            </TwitterShareButton>

            <WhatsappShareButton url={link} title={title}>
              <span className={shareButtonClass}>
                <FaWhatsapp />
                WhatsApp
              </span>
            </WhatsappShareButton>

            <EmailShareButton
              subject={title}
              url={link}
              body="Here's a chord chart I created on ChordPic.com"
            >
              <span className={shareButtonClass}>
                <MdEmail />
                Email
              </span>
            </EmailShareButton>
          </div>
        </>
      )}
    </div>
  );
};
