import * as validation from './../src';

describe('DATE', () => {
    let date = new validation.DateValidator();

    beforeEach(async () => {
        date = new validation.DateValidator();
    });

    test('#required: should return err false if there is a value given and that this value is not empty', async () => {
        date = date.required();
        const newDate: Date = new Date();

        await expect(date.validate(newDate)).resolves.toBe(newDate);
        await expect(date.validate(null)).resolves.toBe(null);
    })

    test('#required: should return an array of err if there is no value providen or that the value is empty', async () => {
        date = date.required();

        await expect(date.validate(NaN)).rejects.not.toBeUndefined();
        await expect(date.validate('a')).rejects.not.toBeUndefined();
        await expect(date.validate(new Date(''))).rejects.not.toBeUndefined();
        await expect(date.validate(() => {})).rejects.not.toBeUndefined();
        await expect(date.validate(undefined)).rejects.not.toBeUndefined();
    })

    test('#default: should return a default value', async () => {
        const defaultValue: Date = new Date();
        date = date.default(defaultValue);

        await expect(date.validate(undefined)).resolves.toBe(undefined);
        await expect(date.max(new Date()).validate(undefined)).resolves.toBe(undefined);
        await expect(date.validate(null)).resolves.toBe(null);

        date = date.required();

        await expect(date.validate(undefined)).resolves.toBe(defaultValue);
        await expect(date.max(new Date()).validate(undefined)).resolves.toBe(defaultValue);
        await expect(date.validate(null)).resolves.toBe(null);

        date = date.notNull();

        await expect(date.validate(null)).resolves.toBe(defaultValue);
    })

    test('#default: should not return a default value', async () => {
        const defaultValue: Date = new Date();
        const newValue: Date = new Date(defaultValue.setFullYear(100));
        date = date.default(defaultValue);

        await expect(date.validate(newValue)).resolves.toBe(newValue);
        date = date.required();
        await expect(date.validate(newValue)).resolves.toBe(newValue);
    })

    test('#notNull: should check if the value is null or not', async () => {
        date = date.notNull();
        const valueToCheck = new Date();

        await expect(date.validate(undefined)).resolves.toBe(undefined);
        await expect(date.validate(valueToCheck)).resolves.toBe(valueToCheck);
        await expect(date.validate(null)).rejects.not.toBeUndefined();
    })

    test('#is: should check if the value is equal to an other value', async () => {
        const valueToCheck: Date = new Date();
        date = date.is(valueToCheck);

        await expect(date.validate(undefined)).resolves.toBe(undefined);
        await expect(date.validate(null)).resolves.toBe(null);
        await expect(date.validate(valueToCheck)).resolves.toBe(valueToCheck);
        await expect(date.validate(valueToCheck.setFullYear(100))).rejects.not.toBeUndefined();
    })

    test('#min: should check if the value bigger than min or equal', async () => {
        const dateToCheck: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 10));
        let dateActuelle: Date = new Date();
        date = date.min(dateToCheck);

        await expect(date.validate(undefined)).resolves.toBeUndefined();
        await expect(date.validate(null)).resolves.toBe(null);
        await expect(date.validate(dateActuelle)).resolves.toBe(dateActuelle);
        await expect(date.validate(dateToCheck)).resolves.toBe(dateToCheck);
    });

    test('#min: should return an array of errors if test is smaller or not a date', async () => {
        const dateToCheck: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 10));
        let dateToTest: Date =  new Date(new Date().setFullYear(new Date().getFullYear() - 11));
        date = date.min(dateToCheck);

        await expect(date.validate(dateToTest)).rejects.not.toBeUndefined();
        await expect(date.validate('a')).rejects.not.toBeUndefined();
        await expect(date.validate(3)).rejects.not.toBeUndefined();
    });

    test('#max: should check if the value smaller than max or equal', async () => {
        const dateToCheck: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
        let dateActuelle: Date = new Date();
        date = date.max(dateToCheck);

        await expect(date.validate(undefined)).resolves.toBeUndefined();
        await expect(date.validate(null)).resolves.toBe(null);
        await expect(date.validate(dateActuelle)).resolves.toBe(dateActuelle);
        await expect(date.validate(dateToCheck)).resolves.toBe(dateToCheck);
    });

    test('#max: should return an array of errors if test is bigger or not a date', async () => {
        const dateToCheck: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
        let dateToTest: Date =  new Date(new Date().setFullYear(new Date().getFullYear() + 11));
        date = date.max(dateToCheck);

        await expect(date.validate(dateToTest)).rejects.not.toBeUndefined();
        await expect(date.validate('a')).rejects.not.toBeUndefined();
    });

    test('#strictMin: should check if the value bigger than min', async () => {
        const dateToCheck: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 10));
        let dateActuelle: Date = new Date();
        date = date.strictMin(dateToCheck);

        await expect(date.validate(undefined)).resolves.toBeUndefined();
        await expect(date.validate(null)).resolves.toBe(null);
        await expect(date.validate(dateActuelle)).resolves.toBe(dateActuelle);
    });

    test('#strictMin: should return an array of errors if test is smaller or equal or not a date', async () => {
        const dateToCheck: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 10));
        let dateToTest: Date =  new Date(new Date().setFullYear(new Date().getFullYear() - 11));
        date = date.strictMin(dateToCheck);

        await expect(date.validate(dateToTest)).rejects.not.toBeUndefined();
        await expect(date.validate(dateToCheck)).rejects.not.toBeUndefined();
        await expect(date.validate('a')).rejects.not.toBeUndefined();
        await expect(date.validate(3)).rejects.not.toBeUndefined();
    });

    test('#strictMax: should check if the value smaller than max or equal', async () => {
        const dateToCheck: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
        let dateActuelle: Date = new Date();
        date = date.strictMax(dateToCheck);

        await expect(date.validate(undefined)).resolves.toBeUndefined();
        await expect(date.validate(null)).resolves.toBe(null);
        await expect(date.validate(dateActuelle)).resolves.toBe(dateActuelle);
    });

    test('#strictMax: should return an array of errors if test is bigger or not a date', async () => {
        const dateToCheck: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
        let dateToTest: Date =  new Date(new Date().setFullYear(new Date().getFullYear() + 11));
        date = date.strictMax(dateToCheck);

        await expect(date.validate(dateToTest)).rejects.not.toBeUndefined();
        await expect(date.validate(dateToCheck)).rejects.not.toBeUndefined();
        await expect(date.validate('a')).rejects.not.toBeUndefined();
    });
})