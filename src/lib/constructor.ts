import StringSchema from './types/string';
import NumberSchema from './types/number';
import BooleanSchema from './types/boolean';
import DateSchema from './types/date';
import validate from './validation';
import { ResponseInterface } from './schemaType';

type ValidatorsTypes = StringSchema | NumberSchema | BooleanSchema | DateSchema;

export default class ValidatorConstructor<T extends any = any> {
    schema: T;
    validator: any = {};

    /**
     * Set the first var
     * @param {*} schema
     */
    constructor(schema: T) {
        const datas = this._init(schema);
        this.schema = datas.schema;
        this.validator = datas.validator;
    }

    /**
     * Validate the different data given
     * with the validation function created
     * - it's for data validation of put and create action
     * @param {*} data
     */
    public validate(data: any, strict: boolean = true, callback?: (value?: T, error?: boolean | ResponseInterface[]) => {}): Promise<T> {
        return validate(data, this.validator, strict, false, callback);
    }

    /**
     * Validate the different data given
     * except the required data
     * - it's for data validation in patch action
     * @param {*} data
     */
    public validateWithoutRequired(data: any, strict: boolean = true, callback?: (value?: T, error?: boolean | ResponseInterface[]) => {}): Promise<T> {
        return validate(data, this.validator, strict, true, callback);
    }

    /**
     * Add some element to the schema and to the validator
     * @param data
     */
    public add(data: any) {
        const datas = this._init(data);

        const keys: string[] = Object.keys(datas.schema);
        for(let i = 0, length = keys.length; i < length; i++) {
            const key: string = keys[i];
            this.schema[key] = datas.schema[key];

            if(typeof datas.validator[key] !== 'undefined') {
                this.validator[key] = datas.validator[key];
            }
        }
    }

    /**
     * Init the validator
     */
    private _init(schema: any): { schema: any, validator: any } {
        const validator: any = {};

        for (let key in schema) {
            if (typeof schema[key] === 'object') {
                const validation = this._constructValidator(schema[key]);
                if(typeof validation !== 'undefined') validator[key] = validation;
            } else {
                if (schema[key] === String || schema[key] === 'String') {
                    validator[key] = new StringSchema();
                }
                if (schema[key] === Number || schema[key] === 'Number') {
                    validator[key] = new NumberSchema();
                }
                if (schema[key] === Date || schema[key] === 'Date') {
                    validator[key] = new DateSchema();
                }
                if (schema[key] === Boolean || schema[key] === 'Boolean') {
                    validator[key] = new BooleanSchema();
                }
            }
        }

        return {
            schema,
            validator
        }
    }

    /**
     * Generate the validator for each element of an object
     * @param object
     */
    private _generateObjectValidator(object: any): any {
        let validator: any = {};
        for(let key in object) {
            const validation = this._constructValidator(object[key]);
            if(typeof validation !== 'undefined') validator[key] = validation;
        }
        if(Object.keys(validator).length) return validator;
        return undefined;
    }

    /**
     * Construct the validator data
     * For each properties of the schema
     * if there is a correlation with the validator function
     * we had a validation function for this element
     * @param {*} object
     * @param {String} KEY
     */
    private _constructValidator(object: any): any {
        if(Array.isArray(object)) {
            const validator = this._constructValidator(object[0]);
            if(typeof validator !== 'undefined') return [validator];
        } else {
            if(typeof object === 'object') {
                if (object.hasOwnProperty('type')) {
                    switch (object.type) {
                        case String:
                        case 'String':
                            return this._generateStringValidator(object);
                        case Number:
                        case 'Number':
                            return this._generateNumberValidator(object);
                        case Date:
                        case 'Date':
                            return this._generateDateValidator(object);
                        case Boolean:
                        case 'Boolean':
                            return this._generateBooleanValidator(object);
                        default:
                            return this._generateObjectValidator(object);
                    }
                } else {
                    return this._generateObjectValidator(object);
                }
            }
        }
    }

    /**
     * Generate the validator for the string element
     * with the given properties of the object
     * @param object
     */
    private _generateStringValidator(object: any): StringSchema {
        const validator = new StringSchema();

        for (let key in object) {
            const value = object[key];

            switch (key) {
                case 'min':
                case 'minlength':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.min(value[0]);
                        if(value.length === 2) validator.min(value[0], value[1]);
                    } else {
                        validator.min(value);
                    }
                    break;
                case 'strictMin':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.strictMin(value[0]);
                        if(value.length === 2) validator.strictMin(value[0], value[1]);
                    } else {
                        validator.strictMin(value);
                    }
                    break;
                case 'max':
                case 'maxlength':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.max(value[0]);
                        if(value.length === 2) validator.max(value[0], value[1]);
                    } else {
                        validator.max(value);
                    }
                    break;
                case 'strictMax':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.strictMax(value[0]);
                        if(value.length === 2) validator.strictMax(value[0], value[1]);
                    } else {
                        validator.strictMax(value);
                    }
                    break;
                case 'toLowercase':
                    if(object[key]) validator.toLowercase();
                    break;
                case 'toUppercase':
                    if(object[key]) validator.toUppercase();
                    break;
                case 'matches':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.matches(value[0]);
                        if(value.length === 2) validator.matches(value[0], value[1]);
                    } else {
                        validator.matches(value);
                    }
                    break;
                case 'enum':
                    if(value.length === 1) {
                        if(Array.isArray(value[0])) {
                            validator.enum(value[0]);
                        } else {
                            validator.enum(value);
                        }
                    } else if(value.length === 2) {
                        if(Array.isArray(value[0])) {
                            validator.enum(value[0], value[1]);
                        } else {
                            validator.enum(value);
                        }
                    } else {
                        validator.enum(value);
                    };
                    break;
                case 'isEmail':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isEmail();
                            if(typeof value[0] === 'string') validator.isEmail(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isEmail(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isEmail();
                        if(typeof value === 'string') validator.isEmail(value);
                    }
                    break;
                case 'isUrl':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isUrl();
                            if(typeof value[0] === 'string') validator.isUrl(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isUrl(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isUrl();
                        if(typeof value === 'string') validator.isUrl(value);
                    }
                    break;
                case 'required':
                    this._isRequired(validator, value);
                    break;
                case 'notNull':
                    this._notNull(validator, value);
                    break;
                case 'is':
                    this._is(validator, value);
                    break;
                case 'default':
                    validator.default(value);
                    break;
                default:
                    break;
            }
        }

        return validator;
    }

    /**
     * Generate the validator for the number element
     * with the given properties of the object
     * @param object
     */
    private _generateNumberValidator(object: any): NumberSchema {
        const validator = new NumberSchema();

        for (let key in object) {
            const value = object[key];

            switch (key) {
                case 'min':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.min(value[0]);
                        if(value.length === 2) validator.min(value[0], value[1]);
                    } else {
                        validator.min(value);
                    }
                    break;
                case 'strictMin':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.strictMin(value[0]);
                        if(value.length === 2) validator.strictMin(value[0], value[1]);
                    } else {
                        validator.strictMin(value);
                    }
                    break;
                case 'max':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.max(value[0]);
                        if(value.length === 2) validator.max(value[0], value[1]);
                    } else {
                        validator.max(value);
                    }
                    break;
                case 'strictMax':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.strictMax(value[0]);
                        if(value.length === 2) validator.strictMax(value[0], value[1]);
                    } else {
                        validator.strictMax(value);
                    }
                    break;
                case 'isPositive':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isPositive();
                            if(typeof value[0] === 'string') validator.isPositive(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isPositive(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isPositive();
                        if(typeof value === 'string') validator.isPositive(value);
                    }
                    break;
                case 'isNegative':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isNegative();
                            if(typeof value[0] === 'string') validator.isNegative(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isNegative(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isNegative();
                        if(typeof value === 'string') validator.isNegative(value);
                    }
                    break;
                case 'isInteger':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isInteger();
                            if(typeof value[0] === 'string') validator.isInteger(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isInteger(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isInteger();
                        if(typeof value === 'string') validator.isInteger(value);
                    }
                    break;
                case 'isOdd':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isOdd();
                            if(typeof value[0] === 'string') validator.isOdd(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isOdd(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isOdd();
                        if(typeof value === 'string') validator.isOdd(value);
                    }
                    break;
                case 'isEven':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isEven();
                            if(typeof value[0] === 'string') validator.isEven(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isEven(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isEven();
                        if(typeof value === 'string') validator.isEven(value);
                    }
                    break;
                case 'required':
                    this._isRequired(validator, value);
                    break;
                case 'notNull':
                    this._notNull(validator, value);
                    break;
                case 'is':
                    this._is(validator, value);
                    break;
                case 'default':
                    validator.default(value);
                    break;
                default:
                    break;
            }
        }

        return validator;
    }

    /**
     * Generate the validator for the boolean element
     * with the given properties of the object
     * @param object
     */
    private _generateBooleanValidator(object: any): BooleanSchema {
        const validator = new BooleanSchema();

        for (let key in object) {
            const value = object[key];

            switch (key) {
                case 'isTrue':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isTrue();
                            if(typeof value[0] === 'string') validator.isTrue(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isTrue(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isTrue();
                        if(typeof value === 'string') validator.isTrue(value);
                    }
                    break;
                case 'isFalse':
                    if(Array.isArray(value)) {
                        if(value.length === 1) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isFalse();
                            if(typeof value[0] === 'string') validator.isFalse(value[0]);
                        }
                        if(value.length === 2) {
                            if(typeof value[0] === 'boolean' && value[0]) validator.isFalse(value[1]);
                        }
                    } else {
                        if(typeof value === 'boolean' && value) validator.isFalse();
                        if(typeof value === 'string') validator.isFalse(value);
                    }
                    break;
                case 'required':
                    this._isRequired(validator, value);
                    break;
                case 'notNull':
                    this._notNull(validator, value);
                    break;
                case 'is':
                    this._is(validator, value);
                    break;
                case 'default':
                    validator.default(value);
                    break;
                default:
                    break;
            }
        }

        return validator;
    }

    /**
     * Generate the validator for the date element
     * with the given properties of the object
     * @param object
     */
    private _generateDateValidator(object: any): DateSchema {
        const validator = new DateSchema();

        for (let key in object) {
            const value = object[key];

            switch (key) {
                case 'min':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.min(value[0]);
                        if(value.length === 2) validator.min(value[0], value[1]);
                    } else {
                        validator.min(value);
                    }
                    break;
                case 'strictMin':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.strictMin(value[0]);
                        if(value.length === 2) validator.strictMin(value[0], value[1]);
                    } else {
                        validator.strictMin(value);
                    }
                    break;
                case 'max':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.max(value[0]);
                        if(value.length === 2) validator.max(value[0], value[1]);
                    } else {
                        validator.max(value);
                    }
                    break;
                case 'strictMax':
                    if(Array.isArray(value)) {
                        if(value.length === 1) validator.strictMax(value[0]);
                        if(value.length === 2) validator.strictMax(value[0], value[1]);
                    } else {
                        validator.strictMax(value);
                    }
                    break;
                case 'required':
                    this._isRequired(validator, value);
                    break;
                case 'notNull':
                    this._notNull(validator, value);
                    break;
                case 'is':
                    this._is(validator, value);
                    break;
                case 'default':
                    validator.default(value);
                    break;
                default:
                    break;
            }
        }

        return validator;
    }

    /**
     * Set the property required
     * which is the same for all the elements
     * @param validator
     * @param value
     */
    private _isRequired(validator: ValidatorsTypes, value: Array<any> | boolean): ValidatorsTypes | void {
        if(Array.isArray(value)) {
            if(value.length === 1) {
                if(typeof value[0] === 'boolean' && value[0]) return validator.required();
                if(typeof value[0] === 'string') return validator.required(value[0]);
            }
            if(value.length === 2) {
                if(typeof value[0] === 'boolean' && value[0]) return validator.required(value[1]);
            }
        } else {
            if(typeof value === 'boolean' && value) return validator.required();
            if(typeof value === 'string') return validator.required(value);
        }
    }

    /**
     * Set the property notNull
     * which is the same for all the elements
     * @param validator
     * @param value
     */
    private _notNull(validator: ValidatorsTypes, value: Array<any> | boolean): ValidatorsTypes | void {
        if(Array.isArray(value)) {
            if(value.length === 1) {
                if(typeof value[0] === 'boolean' && value[0]) return validator.notNull();
                if(typeof value[0] === 'string') return validator.notNull(value[0]);
            }
            if(value.length === 2) {
                if(typeof value[0] === 'boolean' && value[0]) return validator.notNull(value[1]);
            }
        } else {
            if(typeof value === 'boolean' && value) return validator.notNull();
            if(typeof value === 'string') return validator.notNull(value);
        }
    }

    /**
     * Set the property is
     * which is the same for all the elements
     * @param validator
     * @param value
     */
    private _is(validator: ValidatorsTypes, value: Array<any> | any): ValidatorsTypes {
        if(Array.isArray(value)) {
            if(value.length === 2) return validator.is(value[0], value[1]);
            return validator.is(value[0]);
        } else {
            return validator.is(value);
        }
    }
}
