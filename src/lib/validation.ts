import BooleanSchema from './types/boolean';
import DateSchema from './types/date';
import StringSchema from './types/string';
import NumberSchema from './types/number';
import { ResponseInterface } from './schemaType';
import findErrorsMessage from './errorsMessages';
import ValidatorConstructor from './constructor';

type ValidatorsSchema = BooleanSchema | DateSchema | StringSchema | NumberSchema | ValidatorConstructor;

/**
 * Validate the schema object given with the validator given.
 * Return a promise with the result if good else with the errors
 * @param schema The Json object Schema
 * @param validator The validator object
 * @param strict If strict, check if the schema and constructor have the sames parameter
 * @param ignoreRequire Default: false: if true, ignore the required test of all tests
 * @param callback
 * @returns Promise
 */
export default async function validate<T = any>(schema: any, validator: ValidatorConstructor<T> | ValidatorsSchema, strict: boolean = true, ignoreRequire: boolean = false, callback?: (value?: T, error?: boolean | ResponseInterface[]) => {}): Promise<T> {
    try {
        const values = await runThrowObject<T>(schema, validator, strict, ignoreRequire);
        if (callback) callback(values, false);
        return Promise.resolve(values);
    } catch(err: any) {
        if (callback) callback(schema, err);
        return Promise.reject(err);
    }
}

/**
 * Throw the entire validator and schema object to check if the values given are good
 * Return the value (in case there is some transformation)
 * @param schema
 * @param validator
 * @param ignoreRequire
 * @returns Promise
 */
async function runThrowObject<T>(schema: any, validator: ValidatorConstructor<T> | ValidatorsSchema, strict: boolean = true, ignoreRequire: boolean = false): Promise<T> {
    /**
     *
     * @param schm
     * @param vldtr
     * @param parameter
     */
    const validateTheElementOrConstructor = async (schm: any, vldtr: any, parameter: string = ''): Promise<any | ResponseInterface[]> => {
        if(vldtr instanceof ValidatorConstructor) {
            if(ignoreRequire) {
                return vldtr.validateWithoutRequired(schm, strict);
            } else {
                return vldtr.validate(schm, strict);
            }
        } else {
            return vldtr.validate(schm, parameter, ignoreRequire);
        }
    }

    /**
     * For each values in the array test the validator
     * @param schm
     * @param vldtr
     * @param parameter
     */
    const validateArray = async (schm: any[], vldtr: ValidatorsSchema, parameter: string = ''): Promise<any | ResponseInterface[]> => {
        const promises: Promise<any | ResponseInterface[]>[] = [];
        const isArray: boolean = Array.isArray(schm);

        if(isArray && schm.length) {
            for(let i = 0, length = schm.length; i < length; i++) {
                promises.push(validateTheElementOrConstructor(schm[i], vldtr, parameter + `[${i}]`));
            }
        } else if(isArray && !schm.length || typeof schm === 'undefined') {
            if(!(vldtr instanceof ValidatorConstructor)){
                try {
                    const result: any = await validateTheElementOrConstructor(undefined, vldtr, parameter);
                    if(typeof result === 'undefined') {
                        return Promise.resolve([]);
                    } else {
                        return Promise.resolve([result]);
                    }
                } catch(err: any) {
                    promises.push(Promise.reject(err));
                }
            } else {
                promises.push(Promise.resolve([]));
            }
        } else {
            promises.push(Promise.reject([{
                message: findErrorsMessage('validator', 'schemaIsArray'),
                name: 'schemaIsArray',
                value: schm,
                parameter: parameter,
                args: {}
            }]))
        }

        return all(promises);
    }

    /**
     * If the element is an instance validator so test the value (if it's an array test all the values in the array)
     * else if it's an object launch checkSchemaValidator
     * @param schm
     * @param vldtr
     * @param parameter
     */
    const checkElement = async (schm: any, vldtr: any, parameter: string = ''): Promise<any | ResponseInterface[]> => {

        if(isInstanceSchemaOrConstructor(vldtr)) {
            // If the validator is an ValidatorsSchema
            // So it just run the tests

            if(Array.isArray(vldtr)) {
                return validateArray(schm, vldtr[0], parameter);
            } else if(Array.isArray(schm)) {
                return validateArray(schm, vldtr, parameter);
            } else {
                return validateTheElementOrConstructor(schm, vldtr, parameter);
            }

        } else {
            return checkSchemaValidator(schm, vldtr, parameter);
        }
    }

    /**
     *
     * @param schm
     * @param vldtr
     */
    const isToCheck = (schm: any, vldtr: any): boolean => {

        /**
         *
         * @param vl
         */
        const runThrowCheck = (vl: any): any => {
            if(typeof vl !== 'undefined') {
                if(isInstanceSchemaOrConstructor(vl)) {
                    if(Array.isArray(vl)) {
                        return vl[0].isRequired;
                    } else {
                        return vl.isRequired;
                    }
                } else {
                    if(Array.isArray(vl)) {
                        return runThrowCheck(vl[0]);
                    } else if(typeof vl === 'object') {
                        const keys = Object.keys(vl);
                        const length = keys.length;
                        for(let i = 0; i < length; i++) {
                            if(runThrowCheck(vl[keys[i]])) return true;
                        }
                    }
                    return false;
                }
            } else {
                return false;
            }
        }

        if(typeof schm === 'undefined') {
            return runThrowCheck(vldtr);
        }

        return true;
    }

    /**
     * Run throw an object schema to check all the keys and try it all.
     * @param schm
     * @param vldtr
     * @param parameter
     */
    const checkSchemaValidator = async (schm: any, vldtr: any, parameter: string = ''): Promise<any | ResponseInterface[]> => {
        let result: any = {};
        const mapPromises: [string, Promise<any | ResponseInterface[]>][] = [];

        const getValues = (arr: [string, Promise<any | ResponseInterface[]>][]): Promise<any | ResponseInterface[]>[] => {
            return arr.map(arr => arr[1]);
        }

        for(let key in vldtr) {
            const toCheck: boolean = isToCheck(schm[key], vldtr[key]);
            if(toCheck) {
                mapPromises.push([key, checkElement(schm[key], vldtr[key], parameter + '.' + key)]);
            }
        }

        try {
            if(mapPromises.length) {
                const arrayResults = await all(getValues(mapPromises));
                let i = 0;
                mapPromises.forEach((value) => {
                    if(
                        (Array.isArray(arrayResults[i]) && arrayResults[i].length) ||
                        (!Array.isArray(arrayResults[i]) && typeof arrayResults[i] !== 'undefined') ||
                        typeof schm[value[0]] !== 'undefined'
                    ) {
                        result[value[0]] = arrayResults[i];
                    }
                    i++;
                });
            }
            if(!strict) {
                for(let key in schm) {
                    if(typeof vldtr[key] === 'undefined') {
                        result[key] = schm[key];
                    }
                }
            }
            return Promise.resolve(result);
        } catch(err: any) {
            return Promise.reject(flattenDeep(err));
        }
    }

    return checkElement(schema, validator, '');
}

/**
 * @param  {ValidatorsSchema} el
 * @returns boolean
 */
const isIntanceValidatorSchema = (el: ValidatorsSchema): boolean => {
    if (
        el instanceof BooleanSchema ||
        el instanceof DateSchema ||
        el instanceof StringSchema ||
        el instanceof NumberSchema ||
        el instanceof ValidatorConstructor
    ) {
        return true;
    }
    return false;
}

/**
 * Check if the object is in instance of each test
 * @param validatorElement
 */
const isInstanceSchemaOrConstructor = (validatorElement: ValidatorsSchema | any): boolean => {
    if (Array.isArray(validatorElement)) {
        return validatorElement.every(vElement => isIntanceValidatorSchema(vElement));
    } else {
        return isIntanceValidatorSchema(validatorElement);
    }
}

/**
 * As Promise.all but get all error messages
 * @param promises
 */
const all = async (promises: Promise<any | ResponseInterface[]>[]): Promise<any | ResponseInterface[]> => {
    const results: any[] = [];
    const errors: Array<ResponseInterface[]> = [];
    let completedIndex: number = 0;

    return new Promise((resolve, reject) => {
        promises.forEach((promise: Promise<any>, index: number) => {
            promise.then(value => {
                results[index] = value;
                completedIndex++;
                if(completedIndex === promises.length) {
                    if(errors.length) reject(errors);
                    resolve(results);
                }
            }).catch(err => {
                errors.push(err);
                completedIndex++;
                if(completedIndex === promises.length) {
                    reject(errors);
                }
            })
        })
    })
}

/**
 *
 * @param arr1
 */
const flattenDeep = (arr1: any[]): any[] => {
    return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
}