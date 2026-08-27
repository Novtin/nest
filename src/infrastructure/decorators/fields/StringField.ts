import {applyDecorators} from '@nestjs/common';
import {toInteger as _toInteger} from 'lodash';
import {IsString, MaxLength, MinLength, Matches, NotEquals} from 'class-validator';
import {BaseField, IArrayFieldOptions, IBaseFieldOptions} from './BaseField';
import {
    getArrayValidators,
    getConstraintValue,
} from './helpers/InternalFieldMetadataHelpers';

export interface IStringFieldOptions extends IBaseFieldOptions, IArrayFieldOptions {
    unique?: boolean,
    notEmpty?: boolean,
    notEmptyConstraintMessage?: string,
    isStringConstraintMessage?: string,
    minConstraintMessage?: string,
    maxConstraintMessage?: string,
    regexp?: RegExp,
    regexpErrorMessage?: string,
}

const STRING_FIELD_DEFAULT_MAX_LENGTH = 250;

export function StringField(options: IStringFieldOptions = {}) {
    return applyDecorators(...[
        BaseField(options, {
            decoratorName: 'StringField',
            appType: 'string',
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
        options.regexp && Matches(
            options.regexp,
            {
                each: options.isArray,
                message: options.regexpErrorMessage || 'Не корректный формат строки',
            },
        ),
        typeof options.min === 'number' && MinLength(options.min, {
            message: options.minConstraintMessage,
            each: options.isArray,
        }),
        typeof options.max === 'number' && MaxLength(_toInteger(options.max) || STRING_FIELD_DEFAULT_MAX_LENGTH, {
            message: options.maxConstraintMessage,
            each: options.isArray,
        }),
    ].filter(Boolean));
}
