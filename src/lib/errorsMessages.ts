import i18next from 'i18next';

/**
 * Select the message error
 * @param {string} type
 * @param {string} funct
 * @param {any} args
 * @param {string} value
 */
export default function findErrorsMessage(type: string = '', funct: string = '', args: any = {}, value: any = ''): string {
    const messages: any = {
        string: {
            min: i18next.t('validation.string.min', {min: args.min, value}),
            max: i18next.t('validation.string.max', {max: args.max, value}),
            strictMin: i18next.t('validation.string.strictMin', {min: args.min, value}),
            strictMax: i18next.t('validation.string.strictMax', {max: args.max, value}),
            matches: i18next.t('validation.string.matches', {regex: args.regex, value}),
            isEmail: i18next.t('validation.string.isEmail', {value}),
            isUrl: i18next.t('validation.string.isUrl', {value}),
            enum: i18next.t('validation.string.enum', {enums: args.enums, value}),

            required: i18next.t('validation.string.required', {value}),
            notNull: i18next.t('validation.string.notNull', {value}),
            is: i18next.t('validation.string.is', {shouldBe: args.shouldBe, value})
        },
        number: {
            min: i18next.t('validation.number.min', {min: args.min, value}),
            max: i18next.t('validation.number.max', {max: args.max, value}),
            strictMin: i18next.t('validation.number.strictMin', {min: args.min, value}),
            strictMax: i18next.t('validation.number.strictMax', {max: args.max, value}),
            isPositive: i18next.t('validation.number.isPositive', {value}),
            isNegative: i18next.t('validation.number.isNegative', {value}),
            isInteger: i18next.t('validation.number.isInteger', {value}),
            isOdd: i18next.t('validation.number.isOdd', {value}),
            isEven: i18next.t('validation.number.isEven', {value}),

            required: i18next.t('validation.number.required', {value}),
            notNull: i18next.t('validation.number.notNull', {value}),
            is: i18next.t('validation.number.is', {shouldBe: args.shouldBe, value})
        },
        boolean: {
            isTrue: i18next.t('validation.boolean.isTrue', {value}),
            isFalse: i18next.t('validation.boolean.isFalse', {value}),

            required: i18next.t('validation.boolean.required', {value}),
            notNull: i18next.t('validation.boolean.notNull', {value}),
            is: i18next.t('validation.boolean.is', {shouldBe: args.shouldBe, value})
        },
        date: {
            min: i18next.t('validation.date.min', {min: args.min, value}),
            max: i18next.t('validation.date.max', {max: args.max, value}),
            strictMin: i18next.t('validation.date.strictMin', {min: args.min, value}),
            strictMax: i18next.t('validation.date.strictMax', {max: args.max, value}),

            required: i18next.t('validation.date.required', {value}),
            notNull: i18next.t('validation.date.notNull', {value}),
            is: i18next.t('validation.date.is', {shouldBe: args.shouldBe, value})
        },
        validator: {
            schemaIsArray: i18next.t('validation.validator.schemaIsArray')
        },
        default: i18next.t('validation.defaut', {value})
    }

    let response: string = '';

    if(typeof messages[type] !== 'undefined' && typeof messages[type][funct] !== 'undefined') {
        response = messages[type][funct];
    } else {
        response = messages.default;
    }

    return response;

}

