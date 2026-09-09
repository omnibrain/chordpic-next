import { adsInitScript, readAdsAssignment } from "./use-ads-assignment";

const EXPIRED = "expires=Thu, 01 Jan 1970 00:00:00 GMT";

function runInitScript() {
  // The script ships as a string to _document, so the only way to exercise it
  // is to run it the way the browser will.
  // eslint-disable-next-line no-eval
  (0, eval)(adsInitScript);
}

describe("reading the ads assignment", () => {
  afterEach(() => {
    document.cookie = `cp_ads=; ${EXPIRED}`;
    document.cookie = `other_cp_ads=; ${EXPIRED}`;
    document.documentElement.classList.remove("ads-off");
  });

  it("reports the arm the server assigned", () => {
    document.cookie = "cp_ads=off";

    expect(readAdsAssignment()).toEqual({ arm: "off", assigned: true });
  });

  it("keeps serving ads when the cookie is missing, but stays out of the analysis", () => {
    expect(readAdsAssignment()).toEqual({ arm: "on", assigned: false });
  });

  it("treats an unrecognised value as unassigned rather than trusting it", () => {
    document.cookie = "cp_ads=maybe";

    expect(readAdsAssignment()).toEqual({ arm: "on", assigned: false });
  });

  it("ignores a cookie whose name merely ends in the one we want", () => {
    document.cookie = "other_cp_ads=off";

    expect(readAdsAssignment()).toEqual({ arm: "on", assigned: false });
  });
});

describe("the pre-hydration init script", () => {
  afterEach(() => {
    document.cookie = `cp_ads=; ${EXPIRED}`;
    document.cookie = `other_cp_ads=; ${EXPIRED}`;
    document.documentElement.classList.remove("ads-off");
  });

  it("marks the document for visitors who see no ads", () => {
    document.cookie = "cp_ads=off";
    runInitScript();

    expect(document.documentElement.classList.contains("ads-off")).toBe(true);
  });

  it("leaves the document alone for visitors who do see ads", () => {
    document.cookie = "cp_ads=on";
    runInitScript();

    expect(document.documentElement.classList.contains("ads-off")).toBe(false);
  });

  it("leaves the document alone when there is no cookie", () => {
    runInitScript();

    expect(document.documentElement.classList.contains("ads-off")).toBe(false);
  });

  it("ignores a cookie whose name merely ends in the one we want", () => {
    document.cookie = "other_cp_ads=off";
    runInitScript();

    expect(document.documentElement.classList.contains("ads-off")).toBe(false);
  });

  it("agrees with readAdsAssignment about who is in which arm", () => {
    document.cookie = "cp_ads=off";
    runInitScript();

    expect(document.documentElement.classList.contains("ads-off")).toBe(true);
    expect(readAdsAssignment().arm).toBe("off");
  });
});
