import {IValidateFunction} from './IValidateFunction';

export const STEROIDS_META_VALIDATORS = 'steroids_meta_validators';

export const getFieldValidators = (MetaClass, fieldName) => {
    return Reflect.getMetadata(STEROIDS_META_VALIDATORS, MetaClass.prototype, fieldName) || [];
}

export function Validator(validatorInstance: IValidateFunction | any) {
    return (object, fieldName) => {

        // Add field to list
        const validators = Reflect.getMetadata(STEROIDS_META_VALIDATORS, object, fieldName) || [];
        if (!validators.includes(validatorInstance)) {
            validators.push(validatorInstance);
        }
        Reflect.defineMetadata(STEROIDS_META_VALIDATORS, validators, object, fieldName);
    };
}
