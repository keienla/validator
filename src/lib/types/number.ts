import { SchemaType } from './../schemaType';

export default class NumberSchema extends SchemaType {

    constructor() {
        super();

        this.type = 'number';
    }

    /**
     * Set a default value
     * if the value not exist
     * @param {*} value
     */
    public default(value: number | null): this {
        this.defaultValue = value;

        return this;
    }

    /**
     * Check if the size of the number
     * is inferior to the {{min}}
     * @param {Number} min
     * @param {String} message
     */
    public min(min: number, message?: string): this {
        return this.test({
            name: 'min',
            args: {min},
            message,
            testIfNull: false,
            test: (value: number): boolean => {
                return this._typeCheck(min) && value >= min
            }
        })
    }

    /**
     * Check if the size of the number
     * is superior to the {{max}}
     * @param {Number} max
     * @param {String} message
     */
    public max(max: number, message?: string): this {
        return this.test({
            name: 'max',
            args: {max},
            message,
            testIfNull: false,
            test: (value: number): boolean => {
                return this._typeCheck(max) && value <= max
            }
        })
    }

    /**
     * Check if the size of the number
     * is strict inferior to the {{min}}
     * @param {Number} min
     * @param {String} message
     */
    public strictMin(min: number, message?: string): this {
        this.isRequired = true;
        return this.test({
            name: 'strictMin',
            args: {min},
            message,
            testIfNull: false,
            test: (value: number): boolean => {
                return  this._typeCheck(min) && value > min
            }
        })
    }

    /**
     * Check if the size of the number
     * is strict superior to the {{max}}
     * @param {Number} max
     * @param {String} message
     */
    public strictMax(max: number, message?: string): this {
        return this.test({
            name: 'strictMax',
            args: {max},
            message,
            testIfNull: false,
            test: (value: number): boolean => {
                return this._typeCheck(max) && value < max
            }
        })
    }

    /**
     * Check if the number is superior or equal to 0
     * @param {String} message
     */
    public isPositive(message?: string): this {
        return this.min(0, message);
    }

    /**
     * Check if the number is inferior or equal to 0
     * @param {String} message
     */
    public isNegative(message?: string): this {
        return this.max(0, message);
    }

    /**
     * Check if the number is an integer
     * @param {string} message
     */
    public isInteger(message?: string): this {
        return this.test({
            name: 'isInteger',
            args: {},
            message,
            testIfNull: false,
            test: (value: number): boolean => {
                return value % 1 === 0;
            }
        })
    }

    /**
     * Check if the number is odd | not pair
     * @param {string} message
     */
    public isOdd(message?: string): this {
        return this.test({
            name: 'isOdd',
            args: {},
            message,
            testIfNull: false,
            test: (value: number): boolean => {
                return value % 2 === 1 || value % 2 === -1;
            }
        })
    }

    /**
     * Check if the number is even | pair
     * @param {string} message
     */
    public isEven(message?: string): this {
        return this.test({
            name: 'isEven',
            args: {},
            message,
            testIfNull: false,
            test: (value: number): boolean => {
                return value % 2 === 0;
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
            test: (value: number): boolean => {
                return !(this.isUndefined(value) || isNaN(value));
            }
        })
    }

    /**
     * Set the value to a string or to null
     * @param {*} value
     */
    protected _initValue(value: any): number | null | undefined {
        if(this.isUndefined(value)) return value;
        if(this.isNull(value)) return value;

        if(this.isType(value)) return value;

        const parsed = parseFloat(value);
        if(this.isType(parsed)) return parsed;

        return NaN;
    }

    /**
     * Check if the value is a string
     * @param {*} value
     */
    protected _typeCheck(value: any): boolean {
        if(value instanceof Number) value = value.valueOf();

        return typeof value === this.type;
    }
}