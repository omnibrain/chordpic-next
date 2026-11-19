import { signInDestination } from "./auth-redirect";

it.each([
  ["", "/account"],
  ["?next=%2F", "/"],
  ["?next=%2Fmy-chords", "/my-chords"],
  ["?next=https%3A%2F%2Fevil.com", "/account"],
  ["?next=%2F%2Fevil.com", "/account"],
  ["?next=%2F%5Cevil.com", "/account"],
  ["?next=my-chords", "/account"],
  ["?next=%2Fmy-chords%3Fq%3D1", "/my-chords?q=1"],
  ["?next=%2F%0A%2Fevil.com", "/account"],
  ["?next=%2F%09%2Fevil.com", "/account"],
  ["?next=%2F%0D%2Fevil.com", "/account"],
  ["?next=%2F.%2F%2Fevil.com", "/account"],
  ["?next=%2F%5C%5Cevil.com", "/account"],
])("signInDestination(%p) is %p", (search, expected) => {
  expect(signInDestination(search)).toBe(expected);
});
