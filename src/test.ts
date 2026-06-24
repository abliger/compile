import { RList } from "./lex.ts";

const rlist = new RList("./src/test.txt");
rlist.read();
while (true) {
  const byte = rlist.getCurrentByte();
  if (byte === null) {
    break;
  }
  console.log(byte);
}
rlist.close();
