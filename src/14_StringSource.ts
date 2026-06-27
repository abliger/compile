export interface Source {
  // 读取并消费当前字节，返回 null 表示已结束
  getCurrentByte(): string | null;
  // 预读下一个将要被消费的字节，不移动指针
  peek(): string | null;
  // 获得位置信息
  getPosition(): number[];
  // 关闭源（如关闭文件句柄），字符串源可空实现
  close(): void;
}
// 基于字符串的输入源，用于直接从内存中的字符串读取字符。
export class StringSource implements Source {
  private content: string;
  private ptr: number = 0;
  private line = 1;
  private charNum = 1;

  constructor(content: string) {
    this.content = content;
  }

  getCurrentByte(): string | null {
    if (this.ptr >= this.content.length) {
      return null;
    }

    const ch = this.content[this.ptr++];
    if (ch === "\n") {
      this.line++;
      this.charNum = 1;
    } else {
      this.charNum++;
    }
    return ch;
  }

  getPosition(): number[] {
    return [this.line, this.charNum];
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
