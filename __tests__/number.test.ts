import * as validation from './../src';

describe('NUMBER', () => {
    let number = new validation.NumberValidator();

    beforeEach(async () => {
        number = new validation.NumberValidator();
    });

    test('#min: should return err false if test is bigger or equal than min size', async () => {
        number = number.min(3);

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(3)).resolves.toBe(3);
        await expect(number.validate(4)).resolves.toBe(4);
        await expect(number.validate('4')).resolves.toBe(4);
    })

    test('#min: should return an array of errors if test is smaller or not a number', async () => {
        number = number.min(3);

        await expect(number.validate(2)).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#max: should return err false if test is smaller or equal than max size', async () => {
        number = number.max(3);

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(3)).resolves.toBe(3);
        await expect(number.validate(2)).resolves.toBe(2);
        await expect(number.validate('2')).resolves.toBe(2);
    })

    test('#max: should return an array of errors if test is bigger or not a number', async () => {
        number = number.max(3);

        await expect(number.validate(4)).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#strictMin: should return err false if test is bigger than min size', async () => {
        number = number.strictMin(3);

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(4)).resolves.toBe(4);
        await expect(number.validate('4')).resolves.toBe(4);
    })

    test('#strictMin: should return array of error if test is smaller or equal than min size', async () => {
        number = number.strictMin(3);

        await expect(number.validate(3)).rejects.not.toBeUndefined();
        await expect(number.validate(2)).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#strictMax: should return err false if test is smaller than min size', async () => {
        number = number.strictMax(3);

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(2)).resolves.toBe(2);
        await expect(number.validate('2')).resolves.toBe(2);
    })

    test('#strictMax: should return array of error if test is bigger or equal than min size', async () => {
        number = number.strictMax(3);

        await expect(number.validate(3)).rejects.not.toBeUndefined();
        await expect(number.validate(4)).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#isPositive: should return err false if test is positive', async () => {
        number = number.isPositive();

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(1)).resolves.toBe(1);
        await expect(number.validate('1')).resolves.toBe(1);
        await expect(number.validate(1.5)).resolves.toBe(1.5);
        await expect(number.validate(0)).resolves.toBe(0);
    })

    test('#isPositive: should return array of error if test is negative', async () => {
        number = number.isPositive();

        await expect(number.validate(-1)).rejects.not.toBeUndefined();
        await expect(number.validate('-1')).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#isNegative: should return err false if test is negative', async () => {
        number = number.isNegative();

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(0)).resolves.toBe(0);
        await expect(number.validate(-1)).resolves.toBe(-1);
        await expect(number.validate('-1')).resolves.toBe(-1);
        await expect(number.validate(-1.5)).resolves.toBe(-1.5);
    })

    test('#isNegative: should return array of error if test is positive', async () => {
        number = number.isNegative();

        await expect(number.validate(1)).rejects.not.toBeUndefined();
        await expect(number.validate('1')).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#isInteger: should return err false if test is an integer', async () => {
        number = number.isInteger();

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(-1)).resolves.toBe(-1);
        await expect(number.validate('1')).resolves.toBe(1);
        await expect(number.validate(1)).resolves.toBe(1);
        await expect(number.validate(0)).resolves.toBe(0);
    })

    test('#isInteger: should return array of error if test is a float', async () => {
        number = number.isInteger();

        await expect(number.validate(-1.5)).rejects.not.toBeUndefined();
        await expect(number.validate(0.5)).rejects.not.toBeUndefined();
        await expect(number.validate('1.5')).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#isOdd: should return err false if test is an odd number', async () => {
        number = number.isOdd();

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(-3)).resolves.toBe(-3);
        await expect(number.validate('3')).resolves.toBe(3);
        await expect(number.validate(1)).resolves.toBe(1);
        await expect(number.validate(17)).resolves.toBe(17);
    })

    test('#isOdd: should return array of error if test is an even number', async () => {
        number = number.isOdd();

        await expect(number.validate(-2)).rejects.not.toBeUndefined();
        await expect(number.validate(2)).rejects.not.toBeUndefined();
        await expect(number.validate('2')).rejects.not.toBeUndefined();
        await expect(number.validate(0)).rejects.not.toBeUndefined();
        await expect(number.validate(2.5)).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#isEven: should return err false if test is an even number', async () => {
        number = number.isEven();

        await expect(number.validate(undefined)).resolves.toBeUndefined();
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(-2)).resolves.toBe(-2);
        await expect(number.validate('2')).resolves.toBe(2);
        await expect(number.validate(0)).resolves.toBe(0);
        await expect(number.validate(14)).resolves.toBe(14);
    })

    test('#isEven: should return array of error if test is an odd number', async () => {
        number = number.isEven();

        await expect(number.validate(-1)).rejects.not.toBeUndefined();
        await expect(number.validate(1)).rejects.not.toBeUndefined();
        await expect(number.validate('1')).rejects.not.toBeUndefined();
        await expect(number.validate(2.5)).rejects.not.toBeUndefined();
        await expect(number.validate('a')).rejects.not.toBeUndefined();
    })

    test('#required: should return err false if there is a value given and that this value is not empty', async () => {
        number = number.required();

        await expect(number.validate(1)).resolves.toBe(1);
        await expect(number.validate('1')).resolves.toBe(1);
        await expect(number.validate(1.5)).resolves.toBe(1.5);
        await expect(number.validate(-1)).resolves.toBe(-1);
        await expect(number.validate(0)).resolves.toBe(0);
        await expect(number.validate([5,6])).resolves.toBe(5);
        await expect(number.validate(['1'])).resolves.toBe(1);
        await expect(number.validate(null)).resolves.toBe(null);
    })

    test('#required: should return an array of err if there is no value providen or that the value is empty', async () => {
        number = number.required();

        await expect(number.validate('a')).rejects.not.toBeUndefined();
        await expect(number.validate(NaN)).rejects.not.toBeUndefined();
        await expect(number.validate(undefined)).rejects.not.toBeUndefined();
    })

    test('#default: should return a default value', async () => {
        const defaultValue: number = 2;
        number = number.default(defaultValue);

        await expect(number.validate(undefined)).resolves.toBe(undefined);
        await expect(number.min(0).validate(undefined)).resolves.toBe(undefined);
        await expect(number.validate(null)).resolves.toBe(null);

        number = number.required();

        await expect(number.validate(undefined)).resolves.toBe(defaultValue);
        await expect(number.min(0).validate(undefined)).resolves.toBe(defaultValue);
        await expect(number.validate(null)).resolves.toBe(null);

        number = number.notNull();

        await expect(number.validate(null)).resolves.toBe(defaultValue);
    })

    test('#default: should not return a default value', async () => {
        const defaultValue: number = 2;
        number = number.default(defaultValue);

        await expect(number.validate(1)).resolves.toBe(1);
        number = number.required();
        await expect(number.validate(1)).resolves.toBe(1);
    })

    test('#notNull: should check if the value is null or not', async () => {
        number = number.notNull();

        await expect(number.validate(undefined)).resolves.toBe(undefined);
        await expect(number.validate(1)).resolves.toBe(1);
        await expect(number.validate(null)).rejects.not.toBeUndefined();
    })

    test('#is: should check if the value is equal to an other value', async () => {
        const valueToCheck: number = 1;
        number = number.is(valueToCheck);

        await expect(number.validate(undefined)).resolves.toBe(undefined);
        await expect(number.validate(null)).resolves.toBe(null);
        await expect(number.validate(valueToCheck)).resolves.toBe(valueToCheck);
        await expect(number.validate(2)).rejects.not.toBeUndefined();
    })
});