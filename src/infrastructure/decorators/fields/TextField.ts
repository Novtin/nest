import {applyDecorators} from '@nestjs/common';
import {toInteger as _toInteger} from 'lodash';
import {IsString, MaxLength, MinLength, NotEquals} from 'class-validator';
import {BaseField, IArrayFieldOptions, IBaseFieldOptions} from './BaseField';
import {getArrayValidators, getConstraintValue} from './helpers/InternalFieldMetadataHelpers';

export interface ITextFieldOptions extends IBaseFieldOptions, IArrayFieldOptions {
    notEmpty?: boolean,
    notEmptyConstraintMessage?: string,
    isStringConstraintMessage?: string,
    minConstraintMessage?: string,
    maxConstraintMessage?: string,
}

export function TextField(options: ITextFieldOptions = {}) {
    return applyDecorators(...[
        BaseField(options, {
            decoratorName: 'TextField',
            appType: 'text',
            swaggerType: 'string',
        }),
        ...getArrayValidators(options),
        getConstraintValue(options.notEmpty) && NotEquals('', {
            each: options.isArray,
            message: options.notEmptyConstraintMessage || 'Не должно быть пустым',
        }),
        IsString({
            each: options.isArray,
            message: options.isStringConstraintMessage || 'Должна быть строка',
        }),
        typeof options.min === 'number' && MinLength(options.min, {
            message: `Длина строка должна быть не менее ${options.min}` || options.minConstraintMessage,
            each: options.isArray,
        }),
        typeof options.max === 'number' && MaxLength(_toInteger(options.max), {
            message: `Длина строка должна быть не более ${options.max}` || options.maxConstraintMessage,
            each: options.isArray,
        }),
    ].filter(Boolean));
}
