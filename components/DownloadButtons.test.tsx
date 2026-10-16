import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DownloadButtons } from "./DownloadButtons";
import { ImageService } from "../services/image-service";

jest.mock("@magic-translate/react", () => ({
  T: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("../services/image-service", () => ({
  ImageService: { downloadPng: jest.fn(), downloadSvg: jest.fn() },
}));

const chartDom = document.createElement("div");

jest.mock("./chord/useChart", () => ({
  useChart: () => ({
    ref: { current: chartDom },
    size: { width: 400, height: 500 },
  }),
}));

it("downloads the chart of a server-drawn diagram as PNG", () => {
  // How chord-ssr's markup arrives: svguitar's <svg> inside an outer one.
  chartDom.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg"><svg viewBox="0 0 400 500"></svg></svg>';
  render(<DownloadButtons title="Am" />);

  fireEvent.click(screen.getByRole("button", { name: /Medium PNG/ }));

  expect(ImageService.downloadPng).toHaveBeenCalledWith(
    chartDom.querySelector("svg[viewBox]"),
    400,
    "Am",
  );
});
