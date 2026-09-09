import {
  ADS_ON_BUCKETS,
  BUCKET_COUNT,
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
