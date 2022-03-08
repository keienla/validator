import findErrorsMessage from './errorsMessages';

export type optionsType = 'string' | 'number' | 'date' | 'object' | 'array' | 'mixed' | 'boolean';

export interface TestsInterface {
    name: string,
    args?: any,
    message?: string,
    testIfNull: boolean,
    test(value?: any):boolean,
}

export interface TransformInterface {
    name: string,
    args?: any,
    executeIfNull: boolean,
    transform(value?: any):any,
}

export interface ResponseInterface {
    message: string,
    name: string,
    value: any,
    parameter?: string,
    args?: any
}

export abstract class SchemaType {
    public type: optionsType = 'mixed';
    public nullable: boolean = true;
    public isRequired: boolean = false;
    public tests: TestsInterface[] = [];
    public transforms: TransformInterface[] = [];

    private _defaultValue: any;
    public set defaultValue(value: any) {
        this._defaultValue = this._initValue(value);
    };
    public get defaultValue(): any {
        return this._defaultValue;
    }

    protected constructor() {}

    /**
     * Set a default value
     * if the value not exist
     * @param {*} value
     */
    public default(value: any): this {
        this.defaultValue = value;

        return this;
    }

    /**
     * Check if the value is null or undefined
     * if yes throw an error
     * @param {String} message
     */
    public required(message?: string): this {
        this.isRequired = true;
        return this.test({
            name: 'required',
            args: {},
            message,
            testIfNull: true,
            test: (value: any): boolean => {
                return (!this.isUndefined(value));
            }
        })
    }

    /**
     * Add a custom validator to the element
     * @param  {(value:any)=>boolean} validator
     * @param  {string} message?
     * @returns this
     */
    public addCustomValidator(validator: (value: any) => boolean, message?: string): this {
        return this.test({
            name: validator.toString(),
            args: {},
            message,
            testIfNull: true,
            test: validator
        })
    }

    /**
     * Check if the value is set to null
     * @param {String} message
     */
    public notNull(message?: string): this {
        this.nullable = false;

        return this.test({
            name: 'notNull',
            args: {},
            message,
            testIfNull: true,
            test: (value: any): boolean => {
                return (!this.isNull(value))
            }
        })
    }

    /**
     * Check if the two values are the same
     * @param value
     * @param message
     */
    public is(shouldBe: any, message?: string): this {
        return this.test({
            name: 'is',
            args: {shouldBe},
            message,
            testIfNull: false,
            test: (value: any): boolean => {
                return shouldBe === value;
            }
        })
    }

    /**
     * Function that execute all test
     * to check if each test pass
     * if no throw an error
     * @param value
     */
    public validate(value: any, parameter: string = '', ignoreRequire: boolean = false): Promise<any | ResponseInterface[]> {
        return new Promise((resolve, reject) => {
            let errors: ResponseInterface[] | boolean = false;

            // Init the value
            // Set the good type and transform it
            // if it's needeed
            value = this._initValue(value);

            // If the value is null and there is a default value
            // set the default value
            if(!this.isUndefined(this.defaultValue) && ((this.isUndefined(value) && this.isRequired) || (this.isNull(value) && !this.nullable))) value = this.defaultValue;

            // Execute each test of the array of tests
            for(let test of this.tests) {
                let result: boolean;

                if(!test.args) test.args = {};

                if(test.testIfNull) {
                    if(test.name === 'required' && ignoreRequire) {
                        result = true;
                    } else {
                        result = test.test(value);
                    }
                } else {
                    if(this.isNull(value) || this.isUndefined(value)) {
                        result = true;
                    } else {
                        result = test.test(value);
                    }
                }

                if(!result) {
                    let message: string = '';
                    if(test.message) {
                        message = test.message
                    } else {
                        message = findErrorsMessage(this.type, test.name, test.args, value);
                    }

                    if(typeof errors === 'boolean') errors = [];

                    errors.push({message, value, parameter, name: test.name, args: test.args});
                }
            }

            if(!!errors) reject(errors);

            if(this.transforms.length) {
                for(let transform of this.transforms) {
                    if(transform.executeIfNull || !(this.isNull(value) || this.isUndefined(value))) {
                        value = transform.transform(value);
                    }
                }
            }

            resolve(value);
        })
    }

    /**
     * check if value is null or not
     * @param {*} value
     */
    protected isNull(value: any): boolean {
        return value === null;
    }

    /**
     * Check if the value is set
     * @param value
     */
    protected isUndefined(value: any): boolean {
        return (typeof value === 'undefined');
    }

    /**
     * check if the value is type
     * of class
     * ex: string check if the type is string
     * @param {*} value
     */
    protected isType(value: any): boolean {
        if(this.nullable && this.isNull(value)) return true;

        return !this._typeCheck || this._typeCheck(value);
    }

    /**
     * Add the test to the tests list
     * @param {TestsInterface} args
     */
    protected test(args: TestsInterface): this {
        // Check if the test exist
        // if yes i extract delete it
        this.tests = this.tests.filter(fn => {
            if(fn.name === args.name) {
                if(fn.test === args.test) return false;
            }
            return true;
        });

        // add the test at the tests list
        this.tests.push(args);

        return this;
    }

    /**
     * Add transformation to the suite of execution
     * @param {TransformInterface} args
     */
    protected transform(args: TransformInterface): this {
        // If transform already exist
        // I delete it and add it again
        this.transforms = this.transforms.filter(fn => {
            if(fn.name === args.name) {
                if(fn.transform === args.transform) return false;
            }
            return true;
        });

        this.transforms.push(args);

        return this;
    }

    /**
     * Check the type of the value
     * @param {*} value
     */
    protected abstract _typeCheck(value:any): boolean

    /**
     * Change the value to correspond to it's type
     * if it's needed
     * or it will be transform to null value
     * @param {*} value
     */
    protected abstract _initValue(value: any): any
}