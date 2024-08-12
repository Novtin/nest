import {applyDecorators} from '@nestjs/common';
import {Column} from '@steroidsjs/typeorm';
import {toInteger as _toInteger} from 'lodash';
import {IsOptional, IsString, MaxLength, MinLength} from 'class-validator';
import {BaseField, IBaseFieldOptions} from './BaseField';

export interface ITextFieldOptions extends IBaseFieldOptions {
    isStringConstraintMessage?: string,
    minConstraintMessage?: string,
    maxConstraintMessage?: string,
}

export function TextField(options: ITextFieldOptions = {}) {
    return applyDecorators(
        BaseField(options, {
            decoratorName: 'TextField',
            appType: 'text',
            jsType: 'string',
        }),
        Column({
            type: 'text',
            length: options.max,
            default: options.defaultValue,
            nullable: options.nullable,
        }),
        IsString({
            each: options.isArray,
            message: options.isStringConstraintMessage || 'Должна быть строка',
        }),
        !options.required && IsOptional(),
        typeof options.min === 'number' && MinLength(options.min, {
            message: options.minConstraintMessage,
            each: options.isArray,
        }),
        typeof options.max === 'number' && MaxLength(_toInteger(options.max), {
            message: options.maxConstraintMessage,
            each: options.isArray,
        }),

    );
}
