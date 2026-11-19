jest.mock("@supabase/supabase-auth-helpers/nextjs", () => ({
  supabaseClient: {},
}));

import { likePattern } from "./saved-chords";

it("matches search text literally", () => {
  expect(likePattern("Am")).toBe("%Am%");
  expect(likePattern("100%_\\")).toBe("%100\\%\\_\\\\%");
});
