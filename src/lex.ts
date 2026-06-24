interface Token {
  content: string;
  type: string;
}
import { openSync, readSync, closeSync } from "fs";

export class RList {
  #list: Buffer<ArrayBuffer> = Buffer.alloc(2 * 512); // 双缓冲，两半各 512 字节
  filePath: string;
  fd: number | null = null;
  bytesRead: number = 0; // 当前半区实际读到的字节数
  ptr: number = 0; // 当前读取位置

  #halfSize = 512;
  #halfStart = 0; // 当前正在读取的半区起始位置：0 或 512
  #halfEnd = 0; // 当前半区有效数据结束位置（不含）

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  read() {
    this.fd = openSync(this.filePath, "r");
    this.#switchToHalf(0);
  }

  // 切换到指定半区，并填充它
  #switchToHalf(offset: 0 | 512) {
    this.bytesRead = this.#fill(offset);
    this.#halfStart = offset;
    this.#halfEnd = offset + this.bytesRead;
    this.ptr = offset;
  }

  // 填充指定半区，返回实际读到的字节数
  #fill(offset: 0 | 512): number {
    if (this.fd === null) return 0;
    return readSync(this.fd, this.#list, offset, this.#halfSize, null);
  }

  getCurrentByte(): string | null {
    if (this.ptr >= this.#halfEnd) {
      const nextOffset = this.#halfStart === 0 ? this.#halfSize : 0;
      this.#switchToHalf(nextOffset as 0 | 512);
      if (this.bytesRead === 0) return null;
    }
    return String.fromCharCode(this.#list[this.ptr++]);
  }

  // 预读下一个将要被消费的字节，不移动指针
  peek(): string | null {
    if (this.ptr >= this.#halfEnd) {
      const nextOffset = this.#halfStart === 0 ? this.#halfSize : 0;
      this.#switchToHalf(nextOffset as 0 | 512);
      if (this.bytesRead === 0) return null;
    }
    return String.fromCharCode(this.#list[this.ptr]);
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
