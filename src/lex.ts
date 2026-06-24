interface Token {
  content: string;
  type: string;
}
import { openSync, readSync, closeSync } from "fs";

export class RList {
  #list: Buffer<ArrayBuffer> = Buffer.alloc(6);
  filePath: string;
  fd: number | null = null;
  bytesRead: number | null = null;
  ptr: number = 0;
  constructor(filePath: string) {
    this.filePath = filePath;
  }

  read() {
    // 读取文件内容到 #list 中

    // 方式2：打开 fd，手动按字节读
    this.fd = openSync(this.filePath, "r");
    this.bytesRead = readSync(
      this.fd,
      this.#list,
      0,
      this.#list.length / 2,
      null,
    );
  }

  getCurrentByte(): string | null {
    if (this.bytesRead == 0) {
      return null;
    }
    if (this.ptr == 0 && this.fd !== null) {
      this.bytesRead = readSync(
        this.fd,
        this.#list,
        this.#list.length / 2,
        this.#list.length,
        null,
      );
    } else if (this.ptr == this.#list.length / 2 + 1 && this.fd !== null) {
      this.bytesRead = readSync(
        this.fd,
        this.#list,
        0,
        this.#list.length / 2,
        null,
      );
    }
    if (this.ptr >= this.#list.length) {
      this.ptr = 0;
    }
    const byte = this.#list[this.ptr];
    this.ptr++;
    return String.fromCharCode(byte);
  }

  getNextByte(): string | null {
    if (this.bytesRead == 0) {
      return null;
    }
    return String.fromCharCode(this.#list[this.ptr++]);
  }

  close() {
    if (this.fd !== null) {
      closeSync(this.fd);
      this.fd = null;
    }
  }
}

export function lex(str: string): Token[] | void {
  // 使用数组来存放 str 读入

  const read: Array<string | null> = new Array(40).fill(null);

  while (true) {}
}
