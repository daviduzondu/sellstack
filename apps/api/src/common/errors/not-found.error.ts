import { NotFoundException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';

export class NotFoundError extends NotFoundException {
  constructor(message: string) {
    super({ message });
  }

  static getSchema(message: string) {
    return Type.Object(
      { message: Type.Literal(message) },
      { description: message },
    );
  }
}
