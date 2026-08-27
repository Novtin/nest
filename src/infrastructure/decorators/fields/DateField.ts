import {applyDecorators} from '@nestjs/common';
import {IsISO8601, ValidationArguments} from 'class-validator';
import {formatISO9075, parseISO} from 'date-fns';
import {BaseField, IArrayFieldOptions, IBaseFieldOptions} from './BaseField';
import {Transform, transformValueOrArray, TRANSFORM_TYPE_FROM_DB, TRANSFORM_TYPE_TO_DB} from '../Transform';
import {MinDate} from '../validators/MinDate';
import {MaxDate} from '../validators/MaxDate';
import {getArrayValidators} from './helpers/InternalFieldMetadataHelpers';

export const normalizeDate = (rawValue) => {
    if (!rawValue) {
        return rawValue;
    }

    let value = rawValue;
    if (typeof value === 'string') {
        value = parseISO(rawValue);
    }

    try {
        return formatISO9075(value, {representation: 'date'});
    } catch (e) {
        return null;
    }
};

export const normalizeFunctionDate = (value, args?: ValidationArguments) => {
    if (typeof value === 'function') {
        value = value(args);
    }

    return normalizeDate(value);
};

export interface IDateFieldOptions extends IBaseFieldOptions, IArrayFieldOptions {
    minDate?: string | Date | Function,
    maxDate?: string | Date | Function,
}

export function DateField(options: IDateFieldOptions = {}) {
    return applyDecorators(
        ...[
            BaseField(options, {
                decoratorName: 'DateField',
                appType: 'date',
                swaggerType: 'string',
            }),
            ...getArrayValidators(options),
            Transform(({value}) => transformValueOrArray(value, normalizeDate), TRANSFORM_TYPE_FROM_DB),
            Transform(({value}) => transformValueOrArray(value, normalizeDate), TRANSFORM_TYPE_TO_DB),
            options.minDate && MinDate(options.minDate, {
                each: options.isArray,
                message: (args) => `Выбрана дата раньше минимально допустимой (${normalizeFunctionDate(options.minDate, args)})`,
            }),
            options.maxDate && MaxDate(options.maxDate, {
                each: options.isArray,
                message: (args) => `Выбрана дата позже максимально допустимой (${normalizeFunctionDate(options.maxDate, args)})`,
            }),
            IsISO8601({}, {
                each: options.isArray,
                message: 'Некорректный формат даты',
            }),
        ].filter(Boolean),
    );
}
