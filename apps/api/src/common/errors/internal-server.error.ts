import { InternalServerErrorException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';

export class InternalServerError extends InternalServerErrorException {
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
