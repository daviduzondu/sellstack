import { BadGatewayException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';

export class BadGatewayError extends BadGatewayException {
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
