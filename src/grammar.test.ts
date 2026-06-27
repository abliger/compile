import { expect, test } from "vitest";
import { parse } from "./grammar.ts";
import { lex } from "./lex.ts";

test("grammar test", () => {
  const tokens = lex("./src/test.txt");
  console.log(tokens);
  const ast = parse(tokens!);

  expect(ast).toMatchSnapshot();
});
