import { IRInstruction } from "./17_ir.ts";

export function run(irs: IRInstruction[]) {
  const map = new Map<string, number>();
  const list: number[] = [];
  let r = null;
  while (irs.length > 0) {
    const ir = irs.shift()!;
    if (ir.op == "PUSH") {
      list.push(ir.arg as number);
    }
    if (ir.op == "ADD") {
      const sec = list.pop() as number;
      const fir = list.pop() as number;
      list.push(fir + sec);
    }
    if (ir.op == "SUB") {
      const sec = list.pop() as number;
      const fir = list.pop() as number;
      list.push(fir - sec);
    }
    if (ir.op == "MUL") {
      const sec = list.pop() as number;
      const fir = list.pop() as number;
      list.push(fir * sec);
    }
    if (ir.op == "DIV") {
      const sec = list.pop() as number;
      const fir = list.pop() as number;
      list.push(fir / sec);
    }
    if (ir.op == "STORE") {
      map.set(ir.arg as string, list.pop() as number);
    }
    if (ir.op == "STORE") {
      list.push(map.get(ir.arg as string) as number);
    }
    if (ir.op == "POP") {
      r = list.pop();
    }
    if (ir.op == "HALT") {
      if (r == null && map.size == 1) {
        for (let entry of map.entries()) {
          return entry[1];
        }
      }
      return r;
    }
  }
}
