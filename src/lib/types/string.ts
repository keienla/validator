import { SchemaType } from './../schemaType';

export default class StringSchema extends SchemaType {

    constructor() {
        super();

        this.type = 'string';
    }

    /**
     * Check if the size of the text
     * have at least {{min}} caracters
     * @param {Number} min
     * @param {String} message
     */
    public min(min: number, message?:string): this {
        return this.test({
            name: 'min',
            args: {min},
            message,
            testIfNull: false,
            test: (value: string): boolean => {
                return (typeof min === 'number') && value.length >= min
            }
        })
    }

    /**
     * Check if the size of the text
     * have maximum {{max}} caracters
     * @param {Number} max
     * @param {String} message
     */
    public max(max: number, message?: string): this {
        return this.test({
            name: 'max',
            args: {max},
            message,
            testIfNull: false,
            test: (value: string) => {
                return (typeof max === 'number') && value.length <= max
            }
        })
    }

    /**
     * Check if the size of the text
     * have at least strict {{min}} caracters
     * @param {Number} min
     * @param {String} message
     */
    public strictMin(min: number, message?: string): this {
        return this.test({
            name: 'strictMin',
            args: {min},
            message,
            testIfNull: false,
            test: (value: string): boolean => {
                return (typeof min === 'number') && value.length > min
            }
        })
    }

    /**
     * Check if the size of the text
     * have strict maximum {{max}} caracters
     * @param {Number} max
     * @param {String} message
     */
    public strictMax(max: number, message?: string): this {
        return this.test({
            name: 'strictMax',
            args: {max},
            message,
            testIfNull: false,
            test: (value: string): boolean => {
                return (typeof max === 'number') && value.length < max
            }
        })
    }

    /**
     * Check the given regex
     * @param {RegExp} regex
     * @param {String} message
     */
    public matches(regex: RegExp, message?: string): this {
        return this.test({
            name: 'matches',
            args: {regex},
            message,
            testIfNull: false,
            test(value: string): boolean {
                const re: RegExp = new RegExp(regex);
                return re.test(value)
            }
        })
    }

    /**
     * Check if a value is in an array of string
     * @param values
     * @param message
     */
    public enum(enums: string[], message?: string): this {
        return this.test({
            name: 'enum',
            args: {enums},
            message,
            testIfNull: false,
            test: (value: string): boolean => {
                const result = enums.find((el: string) => el === value);
                return !this.isUndefined(result);
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
            test: (value: string): boolean => {
                return (!this.isUndefined(value) && (this.isNull(value) || value.length > 0))
            }
        })
        return this;
    }

    /**
     * Check if the value is an email
     * @param {String} message
     */
    public isEmail(message?: string): this {
        const emailRegexp: RegExp = /^(([^<>()\[\]\.,;:\s@\"]{1,64}(\.[^<>()\[\]\.,;:\s@\"]{1,64})*)|(\".{1,64}\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/i;

        return this.matches(emailRegexp, message);
    }

    /**
     * Check if the element is an URL
     * @param {String} message
     */
    public isUrl(message?: string): this {
        const urlRegexp: RegExp = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u005f-\uffff0-9]+-?)*[a-z\u005f-\uffff0-9]+)(?:\.(?:[a-z\u005f-\uffff0-9]+-?)*[a-z\u005f-\uffff0-9]+)*(?:\.(?:[a-z\u005f-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

        return this.matches(urlRegexp, message);
    }

    /**
     * Transform the value to a uppercase string
     */
    public toUppercase(): this {
        return this.transform({
            name: 'toUppercase',
            args: {},
            executeIfNull: false,
            transform: (value: string): string => {
                return value.toUpperCase();
            }
        })
    }

    /**
     * Transform the string to a lower case string
     */
    public toLowercase(): this {
        return this.transform({
            name: 'toLowercase',
            args: {},
            executeIfNull: false,
            transform: (value: string): string => {
                return value.toLowerCase();
            }
        })
    }

    /**
     * Set the value to a string or to null
     * @param {*} value
     */
    protected _initValue(value: any): string | null | undefined {
        if(this.isType(value)) return value;

        if(!this.isNull(value) && !this.isUndefined(value) && value.toString) return value.toString();

        return value;
    }

    /**
     * Check if the value is a string
     * @param {*} value
     */
    protected _typeCheck(value: any): boolean {
        if(value instanceof String) value = value.valueOf();

        return typeof value === this.type;
    }
}
