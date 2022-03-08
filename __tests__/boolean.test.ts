import * as validation from './../src';

describe('BOOLEAN', () => {
    let boolean = new validation.BooleanValidator();

    beforeEach(async () => {
        boolean = new validation.BooleanValidator();
    });

    test('#isTrue: should return error false if value is true' , async () => {
        boolean = boolean.isTrue();

        await expect(boolean.validate(undefined)).resolves.toBeUndefined();
        await expect(boolean.validate(null)).resolves.toBe(null);
        await expect(boolean.validate(1)).resolves.toBe(true);
        await expect(boolean.validate(true)).resolves.toBe(true);
        await expect(boolean.validate('1')).resolves.toBe(true);
        await expect(boolean.validate('true')).resolves.toBe(true);
    })

    test('#isTrue: should return an array of error if value is false' , async () => {
        boolean = boolean.isTrue();

        await expect(boolean.validate(-1)).rejects.not.toBeUndefined();
        await expect(boolean.validate(0)).rejects.not.toBeUndefined();
        await expect(boolean.validate(false)).rejects.not.toBeUndefined();
        await expect(boolean.validate('false')).rejects.not.toBeUndefined();
        await expect(boolean.validate('0')).rejects.not.toBeUndefined();
        await expect(boolean.validate('a')).rejects.not.toBeUndefined();
    })

    test('#isFalse: should return error false if value is false' , async () => {
        boolean = boolean.isFalse();

        await expect(boolean.validate(undefined)).resolves.toBeUndefined();
        await expect(boolean.validate(null)).resolves.toBe(null);
        await expect(boolean.validate(0)).resolves.toBe(false);
        await expect(boolean.validate(false)).resolves.toBe(false);
        await expect(boolean.validate('0')).resolves.toBe(false);
        await expect(boolean.validate('false')).resolves.toBe(false);
    })

    test('#isFalse: should return an array of error if value is true' , async () => {
        boolean = boolean.isFalse();

        await expect(boolean.validate(-1)).rejects.not.toBeUndefined();
        await expect(boolean.validate(1)).rejects.not.toBeUndefined();
        await expect(boolean.validate(true)).rejects.not.toBeUndefined();
        await expect(boolean.validate('true')).rejects.not.toBeUndefined();
        await expect(boolean.validate('1')).rejects.not.toBeUndefined();
        await expect(boolean.validate('a')).rejects.not.toBeUndefined();
    })

    test('#required: should return err false if there is a value given and that this value is not empty', async () => {
        boolean = boolean.required();

        await expect(boolean.validate(1)).resolves.toBe(true);
        await expect(boolean.validate(true)).resolves.toBe(true);
        await expect(boolean.validate('1')).resolves.toBe(true);
        await expect(boolean.validate(0)).resolves.toBe(false);
        await expect(boolean.validate(false)).resolves.toBe(false);
        await expect(boolean.validate('0')).resolves.toBe(false);
    })

    test('#required: should return an array of err if there is no value providen or that the value is empty', async () => {
        boolean = boolean.required();

        await expect(boolean.validate(NaN)).rejects.not.toBeUndefined();
        await expect(boolean.validate('a')).rejects.not.toBeUndefined();
        await expect(boolean.validate(() => {})).rejects.not.toBeUndefined();
        await expect(boolean.validate(undefined)).rejects.not.toBeUndefined();
    })

    test('#default: should return a default value', async () => {
        const defaultValue: boolean = true;
        boolean = boolean.default(defaultValue);

        await expect(boolean.validate(undefined)).resolves.toBe(undefined);
        await expect(boolean.isTrue().validate(undefined)).resolves.toBe(undefined);
        await expect(boolean.validate(null)).resolves.toBe(null);

        boolean = boolean.required();

        await expect(boolean.validate(undefined)).resolves.toBe(defaultValue);
        await expect(boolean.isTrue().validate(undefined)).resolves.toBe(defaultValue);
        await expect(boolean.validate(null)).resolves.toBe(null);

        boolean = boolean.notNull();

        await expect(boolean.validate(null)).resolves.toBe(defaultValue);
    })

    test('#default: should not return a default value', async () => {
        const defaultValue: boolean = true;
        boolean = boolean.default(defaultValue);

        await expect(boolean.validate(false)).resolves.toBe(false);
        boolean = boolean.required();
        await expect(boolean.validate(false)).resolves.toBe(false);
    })

    test('#notNull: should check if the value is null or not', async () => {
        boolean = boolean.notNull();

        await expect(boolean.validate(undefined)).resolves.toBe(undefined);
        await expect(boolean.validate(true)).resolves.toBe(true);
        await expect(boolean.validate(null)).rejects.not.toBeUndefined();
    })

    test('#is: should check if the value is equal to an other value', async () => {
        const valueToCheck: boolean = true;
        boolean = boolean.is(valueToCheck);

        await expect(boolean.validate(undefined)).resolves.toBe(undefined);
        await expect(boolean.validate(null)).resolves.toBe(null);
        await expect(boolean.validate(valueToCheck)).resolves.toBe(valueToCheck);
        await expect(boolean.validate(false)).rejects.not.toBeUndefined();
    })
})