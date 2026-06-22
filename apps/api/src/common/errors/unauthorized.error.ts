import { UnauthorizedException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';

export class UnauthorizedError extends UnauthorizedException {
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
