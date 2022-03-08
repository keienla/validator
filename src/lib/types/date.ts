import { SchemaType } from './../schemaType';

export default class DateSchema extends SchemaType {

    constructor() {
        super();

        this.type = 'date';
    }

    /**
     * Check if the two values are the same
     * @param value
     * @param message
     */
    public is(shouldBe: Date, message?: string): this {
        shouldBe = new Date(shouldBe);

        return this.test({
            name: 'is',
            args: {shouldBe},
            message,
            testIfNull: false,
            test: (value: any): boolean => {
                return this._typeCheck(shouldBe) && shouldBe.getTime() === value.getTime()
            }
        })
    }

    /**
     * Check if the size of the Date
     * is anterior to the {{min}}
     * @param {Date} min
     * @param {String} message
     */
    public min(min: Date, message?: string): this {
        min = new Date(min);

        return this.test({
            name: 'min',
            args: {min},
            message,
            testIfNull: false,
            test: (value: Date): boolean => {
                return this._typeCheck(min) && value.getTime() >= min.getTime()
            }
        })
    }

    /**
     * Check if the size of the Date
     * is superior to the {{max}}
     * @param {Date} max
     * @param {String} message
     */
    public max(max: Date, message?: string): this {
        max = new Date(max);

        return this.test({
            name: 'max',
            args: {max},
            message,
            testIfNull: false,
            test: (value: Date): boolean => {
                return this._typeCheck(max) && value.getTime() <= max.getTime()
            }
        })
    }

    /**
     * Check if the size of the Date
     * is strict anterior to the {{min}}
     * @param {Date} min
     * @param {String} message
     */
    public strictMin(min: Date, message?: string): this {
        min = new Date(min);

        return this.test({
            name: 'strictMin',
            args: {min},
            message,
            testIfNull: false,
            test: (value: Date): boolean => {
                return this._typeCheck(min) && value.getTime() > min.getTime()
            }
        })
    }

    /**
     * Check if the size of the Date
     * is strict superior to the {{max}}
     * @param {Date} max
     * @param {String} message
     */
    public strictMax(max: Date, message?: string): this {
        max = new Date(max);

        return this.test({
            name: 'strictMax',
            args: {max},
            message,
            testIfNull: false,
            test: (value: Date): boolean => {
                return this._typeCheck(max) && value.getTime() < max.getTime()
            }
        })
    }

    /**
     * Check if the text is defined
     * @param message
     */
    public required(message?: string): this {
        this.isRequired = true;
        this.test({
            name: 'required',
            args: {},
            message,
            testIfNull: true,
            test: (value: Date): boolean => {
                return (!this.isUndefined(value) && (this._typeCheck(value) || this.isNull(value)))
            }
        })
        return this;
    }

    /**
     * Set the value to a string or to null
     * @param {*} value
     */
    protected _initValue(value: any): Date | null | undefined | any{
        if(this.isUndefined(value)) return value;
        if(this.isNull(value)) return value;

        if(this.isType(value)) return value;

        let test = new Date(value);
        if(this.isType(test)) return test;

        return new Date('');
    }

    /**
     * Check if the value is a string
     * @param {*} value
     */
    protected _typeCheck(value: any): boolean {
        return Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime());
    }
}