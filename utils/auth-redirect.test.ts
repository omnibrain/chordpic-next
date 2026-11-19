import { signInDestination } from "./auth-redirect";

it.each([
  ["", "/account"],
  ["?next=%2F", "/"],
  ["?next=%2Fmy-chords", "/my-chords"],
  ["?next=https%3A%2F%2Fevil.com", "/account"],
  ["?next=%2F%2Fevil.com", "/account"],
  ["?next=%2F%5Cevil.com", "/account"],
  ["?next=my-chords", "/account"],
])("signInDestination(%p) is %p", (search, expected) => {
  expect(signInDestination(search)).toBe(expected);
});
