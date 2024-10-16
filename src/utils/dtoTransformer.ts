import { plainToInstance, ClassConstructor } from 'class-transformer';

export class TransformUtil {
  static toDto<T>(cls: ClassConstructor<T>, plain: any): T {
    return plainToInstance(cls, plain, { excludeExtraneousValues: true });
  }

  static toInternalDto<T>(cls: ClassConstructor<T>, document: any): T {
    return plainToInstance(cls, document.toObject(), { excludeExtraneousValues: false });
  }
}
