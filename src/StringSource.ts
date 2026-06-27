import { Source } from "./source.ts";

// 基于字符串的输入源，用于直接从内存中的字符串读取字符。
export class StringSource implements Source {
  private content: string;
  private ptr: number = 0;

  constructor(content: string) {
    this.content = content;
  }

  getCurrentByte(): string | null {
    if (this.ptr >= this.content.length) {
      return null;
    }
    return this.content[this.ptr++];
  }

  peek(): string | null {
    if (this.ptr >= this.content.length) {
      return null;
    }
    return this.content[this.ptr];
  }

  close(): void {
    // 字符串源无需关闭任何资源
  }
}
