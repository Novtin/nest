import {applyDecorators} from '@nestjs/common';
import {IsInt} from 'class-validator';
import {BaseField, IArrayFieldOptions, IBaseFieldOptions} from './BaseField';
import {getArrayValidators} from './helpers/InternalFieldMetadataHelpers';

export interface IFileField extends IBaseFieldOptions, IArrayFieldOptions {
    isImage?: boolean,
}

export function getFileFieldDecorators(options: IFileField) {
    const finalOptions: IBaseFieldOptions & IArrayFieldOptions = {
        ...options,
        isArrayConstraintMessage: options.isArrayConstraintMessage
            || (options.isArray && (options.isImage ? 'Необходимо загрузить изображения' : 'Необходимо загрузить файлы')),
    };

    return [
        BaseField(finalOptions, {
            decoratorName: 'FileField',
            appType: 'file',
            swaggerType: 'number',
        }),
        ...getArrayValidators(finalOptions),
        !finalOptions.isArray && IsInt({
            message: options.isImage ? 'Необходимо загрузить изображение' : 'Необходимо загрузить файл',
        }),
    ].filter(Boolean);
}

export function FileField(options: IFileField = {}) {
    return applyDecorators(
        ...getFileFieldDecorators(options),
    );
}
