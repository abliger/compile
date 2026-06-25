import { RList } from "./RList.ts";

interface Token {
  content: string;
  type: string;
}
export function lex(filePath: string): Token[] | void {

  const rList = new RList(filePath)

  while (true) {
    const char = rList.getCurrentByte()
    if (char == null) {
      break;
    }
    switch (char) {
      case ' ': return;
    }
  }
  rList.close()
}
