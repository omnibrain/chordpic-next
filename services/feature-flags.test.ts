import {
  ADS_COOKIE,
  ADS_ON_BUCKETS,
  BUCKET_COOKIE,
  BUCKET_COUNT,
  adsAssignmentMetadata,
  parseAdsArm,
  parseAdsMode,
  parseBucket,
  randomBucket,
  resolveAdsArm,
} from "./feature-flags";

describe("ads mode parsing", () => {
  it("accepts the three known modes", () => {
    expect(parseAdsMode("on")).toBe("on");
    expect(parseAdsMode("off")).toBe("off");
    expect(parseAdsMode("split")).toBe("split");
  });

  it("falls back to 'on' rather than silently stopping ad revenue", () => {
    expect(parseAdsMode(undefined)).toBe("on");
    expect(parseAdsMode("")).toBe("on");
    expect(parseAdsMode("OFF")).toBe("on");
    expect(parseAdsMode("disabled")).toBe("on");
  });
});

describe("bucket parsing", () => {
  it("accepts every in-range bucket", () => {
    expect(parseBucket("0")).toBe(0);
    expect(parseBucket(String(BUCKET_COUNT - 1))).toBe(BUCKET_COUNT - 1);
  });

  it("rejects anything that would land a visitor outside the split", () => {
    expect(parseBucket(undefined)).toBeNull();
    expect(parseBucket("")).toBeNull();
    expect(parseBucket("-1")).toBeNull();
    expect(parseBucket(String(BUCKET_COUNT))).toBeNull();
    expect(parseBucket("12.5")).toBeNull();
    expect(parseBucket("nope")).toBeNull();
  });

  it("round-trips whatever randomBucket produces", () => {
    for (let i = 0; i < 500; i++) {
      const bucket = randomBucket();
      expect(parseBucket(String(bucket))).toBe(bucket);
    }
  });
});

describe("arm parsing", () => {
  it("accepts both arms", () => {
    expect(parseAdsArm("on")).toBe("on");
    expect(parseAdsArm("off")).toBe("off");
  });

  it("rejects anything else rather than inventing an assignment", () => {
    expect(parseAdsArm(undefined)).toBeNull();
    expect(parseAdsArm("")).toBeNull();
    expect(parseAdsArm("ON")).toBeNull();
    expect(parseAdsArm("split")).toBeNull();
  });
});

describe("assignment metadata", () => {
  it("records the arm the buyer was on, and the bucket behind it", () => {
    expect(
      adsAssignmentMetadata({ [ADS_COOKIE]: "off", [BUCKET_COOKIE]: "73" }),
    ).toEqual({ adsArm: "off", adsBucket: "73" });
  });

  it("omits what it cannot vouch for instead of guessing", () => {
    expect(adsAssignmentMetadata({})).toEqual({});
    expect(
      adsAssignmentMetadata({ [ADS_COOKIE]: "yes", [BUCKET_COOKIE]: "999" }),
    ).toEqual({});
    expect(adsAssignmentMetadata({ [BUCKET_COOKIE]: "0" })).toEqual({
      adsBucket: "0",
    });
  });

  it("only ever yields strings, which is all Stripe metadata holds", () => {
    const metadata = adsAssignmentMetadata({
      [ADS_COOKIE]: "on",
      [BUCKET_COOKIE]: "0",
    });

    Object.values(metadata).forEach((value) =>
      expect(typeof value).toBe("string"),
    );
  });
});

describe("resolving the ads arm", () => {
  const everyBucket = Array.from({ length: BUCKET_COUNT }, (_, i) => i);

  it("ignores the bucket outside split mode", () => {
    everyBucket.forEach((bucket) => {
      expect(resolveAdsArm("on", bucket)).toBe("on");
      expect(resolveAdsArm("off", bucket)).toBe("off");
    });
  });

  it("splits the buckets in the configured proportion", () => {
    const on = everyBucket.filter(
      (bucket) => resolveAdsArm("split", bucket) === "on",
    );

    expect(on).toHaveLength(ADS_ON_BUCKETS);
  });

  it("keeps a visitor on the same side for a given bucket", () => {
    everyBucket.forEach((bucket) => {
      expect(resolveAdsArm("split", bucket)).toBe(resolveAdsArm("split", bucket));
    });
  });
});
