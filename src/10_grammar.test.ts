import { expect, test } from "vitest";
import { parse } from "./09_grammar.ts";
import { lex, lexString } from "./07_lex.ts";

test("grammar test", () => {
  const tokens = lex("./src/01_test.txt");
  parse(tokens!);
});

test("grammar test 2", () => {
  const code = `
  var content = 4 * 5 + 1;
  const c = content ^ 2;
  `;
  const tokens = lexString(code);
  parse(tokens!);
});

test("grammar test 2", () => {
  const code = `
  const content = 4 * 5 + (1 + (3+2) * 2+ 1);
  `;
  const tokens = lexString(code);
  parse(tokens!);
});
