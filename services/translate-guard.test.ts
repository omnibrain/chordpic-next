import { translateGuardScript } from "./document-scripts";

beforeAll(() => {
  (0, eval)(translateGuardScript);
});

it("ignores React removing a text node Google Translate already moved", () => {
  const parent = document.createElement("p");
  const text = document.createTextNode("Editor");
  parent.appendChild(text);
  // What Google Translate does: wrap the text in its own element.
  const font = document.createElement("font");
  parent.replaceChild(font, text);

  expect(() => parent.removeChild(text)).not.toThrow();
});

it("ignores React inserting before a node Google Translate already moved", () => {
  const parent = document.createElement("p");
  const text = document.createTextNode("Editor");
  parent.appendChild(text);
  parent.replaceChild(document.createElement("font"), text);

  expect(() =>
    parent.insertBefore(document.createElement("span"), text),
  ).not.toThrow();
});

it("still removes and inserts normally", () => {
  const parent = document.createElement("p");
  const a = parent.appendChild(document.createElement("a"));
  const b = parent.insertBefore(document.createElement("b"), a);

  parent.removeChild(a);

  expect(Array.from(parent.children)).toEqual([b]);
});
