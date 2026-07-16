import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
export const Store = createParamDecorator((_, context: ExecutionContext)=>{
    const request = context.switchToHttp().getRequest();
    return request.store;
})