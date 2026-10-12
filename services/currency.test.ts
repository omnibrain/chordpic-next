import { amountIn, currencyForCountry } from "./currency";

describe("currency", () => {
  it("matches the currency Checkout charges in", () => {
    expect(currencyForCountry("DE")).toBe("eur");
    expect(currencyForCountry("li")).toBe("chf");
    expect(currencyForCountry("PL")).toBe("usd");
    expect(currencyForCountry(null)).toBe("usd");
  });

  it("reads the amount from the currency options", () => {
    const price = {
      currency: "usd",
      unit_amount: 400,
      currency_options: { usd: 400, eur: 350 },
    };
    expect(amountIn(price, "eur")).toBe(350);
    expect(amountIn(price, "chf")).toBeNull();
    expect(amountIn({ currency: "usd", unit_amount: 400 }, "usd")).toBe(400);
  });
});
