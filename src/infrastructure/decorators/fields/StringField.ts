import {applyDecorators} from '@nestjs/common';
import {Column} from '@steroidsjs/typeorm';
import {toInteger as _toInteger} from 'lodash';
import {IsOptional, IsString, MaxLength, MinLength} from 'class-validator';
import {BaseField, IBaseFieldOptions} from './BaseField';

export interface IStringFieldOptions extends IBaseFieldOptions {
    unique?: boolean,
    isStringConstraintMessage?: string,
    minConstraintMessage?: string,
    maxConstraintMessage?: string,
}

const STRING_FIELD_DEFAULT_MAX_LENGTH = 250;

export function StringField(options: IStringFieldOptions = {}) {
    const columnType = options.isArray ? 'simple-array' : 'varchar';

    return applyDecorators(...[
        BaseField(options, {
            decoratorName: 'StringField',
            appType: 'string',
            jsType: 'string',
        }),
        Column({
            type: columnType,
            length: options.max,
            default: options.defaultValue,
            unique: options.unique,
            nullable: options.nullable,
        }),
        IsString({
            each: options.isArray,
            message: options.isStringConstraintMessage || 'Должна быть строка',
        }),
        !options.required && IsOptional(), // TODO check nullable and required
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
