import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ShareButtons } from "./ShareButtons";

jest.mock("@magic-translate/react", () => ({
  T: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const chart = {
  chord: { fingers: [], barres: [] },
  settings: { title: "Am7" },
};

it("tracks creating and copying a sharing link", () => {
  const gtag = jest.fn();
  (globalThis as { gtag?: unknown }).gtag = gtag;
  document.execCommand = jest.fn();
  render(<ShareButtons chart={chart} />);

  fireEvent.click(
    screen.getByRole("button", { name: /Generate Sharing Link/ }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Copy" }));

  expect(gtag).toHaveBeenCalledWith("event", "generate_share_link");
  expect(gtag).toHaveBeenCalledWith("event", "share", {
    method: "copy_link",
    content_type: "chord",
    item_id: "Am7",
  });
  delete (globalThis as { gtag?: unknown }).gtag;
});
