import { currencyInitScript } from "./document-scripts";

const EXPIRED = "expires=Thu, 01 Jan 1970 00:00:00 GMT";

function runInitScript() {
  (0, eval)(currencyInitScript);
}

describe("currency init script", () => {
  afterEach(() => {
    document.cookie = `cp_cur=; ${EXPIRED}`;
    document.cookie = `xcp_cur=; ${EXPIRED}`;
    document.cookie = `cp_cur=; ${EXPIRED}`;
    document.documentElement.classList.remove("cur-eur", "cur-chf");
  });

  it("switches the page to euros when the server says so", () => {
    document.cookie = "cp_cur=eur";
    runInitScript();
    expect(document.documentElement.classList.contains("cur-eur")).toBe(true);
  });

  it("switches the page to francs when the server says so", () => {
    document.cookie = "cp_cur=chf";
    runInitScript();
    expect(document.documentElement.classList.contains("cur-chf")).toBe(true);
  });

  it("keeps dollars otherwise", () => {
    document.cookie = "cp_cur=usd";
    document.cookie = "xcp_cur=eur";
    runInitScript();
    expect(document.documentElement.classList.contains("cur-eur")).toBe(false);
  });
});
