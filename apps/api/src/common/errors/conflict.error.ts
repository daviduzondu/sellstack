import { ConflictException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';

export class ConflictError extends ConflictException {
  constructor(message: string) {
    super({ message });
  }

  static getSchema(message: string) {
    return Type.Object({ message: Type.Literal(message) });
  }
}
