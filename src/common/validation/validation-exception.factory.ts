import { BadRequestException, ValidationError } from '@nestjs/common';

export function createValidationExceptionFactory() {
  return (errors: ValidationError[]) => {
    const errorMessages = errors.map(err => {
      console.log(err);
      return Object.values(err.constraints).join('; ');
    }).join('; ');

    return new BadRequestException(errorMessages);
  };
}
