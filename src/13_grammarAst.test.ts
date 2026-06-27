import { expect, test } from "vitest";
import { parse } from "./12_grammarAst.ts";
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
  const node = parse(tokens!);
  expect(node).not.NaN;
  expect(node.statements[0]).toBeTypeOf("object");
  expect(node.statements[0].type).equals("Semicolon");
  expect(node.statements[1].type).equals("Assignment");
});
