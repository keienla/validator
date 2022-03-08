import { SchemaType } from './../schemaType';

export default class BooleanSchema extends SchemaType {

    constructor() {
        super();

        this.type = 'boolean';
    }

    /**
     * Set a default value
     * if the value not exist
     * @param {*} value
     */
    public default(value: boolean | null): this {
        this.defaultValue = value;

        return this;
    }

    /**
     * Check if the boolean is true
     * @param {String} message
     */
    public isTrue(message?: string): this {
        return this.test({
            name: 'isTrue',
            args: {},
            message,
            testIfNull: false,
            test: (value: boolean): boolean => {
                return value === true
            }
        })
    }

    /**
     * Check if the boolean is true
     * @param {String} message
     */
    public isFalse(message?: string): this {
        return this.test({
            name: 'isFalse',
            args: {},
            message,
            testIfNull: false,
            test: (value: boolean): boolean => {
                return value === false
            }
        })
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
            test: (value: boolean): boolean => {
                return !(this.isUndefined(value) || (value !== true && value !== false && !this.isNull(value)));
            }
        })
    }


    /**
     * Set the value to a string or to null
     * @param {*} value
     */
    protected _initValue(value: any): boolean | any {
        if(!this.isType(value)) {
            if (/^(true|1)$/i.test(value)) return true;
            if (/^(false|0)$/i.test(value)) return false;
        }

        return value;
    }

    /**
     * Check if the value is a string
     * @param {*} value
     */
    protected _typeCheck(value: any): boolean {
        if (value instanceof Boolean) value = value.valueOf();

        return typeof value === this.type;
    }
}