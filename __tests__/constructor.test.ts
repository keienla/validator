import * as validation from './../src';

describe('CONSTRUCTOR', () => {
    let obj: {
        s?: validation.ConstructorValidatorInterfaces.StringConstructorType,
        n?: validation.ConstructorValidatorInterfaces.NumberConstructorType,
        b?: validation.ConstructorValidatorInterfaces.BooleanConstructorType,
        d?: validation.ConstructorValidatorInterfaces.DateConstructorType,
        as?: [validation.ConstructorValidatorInterfaces.StringConstructorType],
        t?: number
    }
    let constructor: validation.ConstructorValidator;

    const getTests = (name: string, tests: any[]): any[] => {
        return tests.filter((test) => test.name === name)
    }

    const getTransforms = (name: string, transforms: any[]): any[] => {
        return transforms.filter((transform) => transform.name === name)
    }

    beforeEach(async () => {

    });

    test('Create a simple constructor to test instance of each type of element' , async () => {
        // Set each properties for each type
        obj = {
            s: {type: String, default: 's'},
            n: {type: Number, default: 0},
            b: {type: Boolean, default: true},
            d: {type: Date, default: new Date()},
            as: [{type: String}],
            t: 42
        }
        constructor = new validation.ConstructorValidator(obj);

        // Check if there is the properties
        expect(constructor.validator).toHaveProperty('s');
        expect(constructor.validator).toHaveProperty('n');
        expect(constructor.validator).toHaveProperty('b');
        expect(constructor.validator).toHaveProperty('d');
        expect(constructor.validator).toHaveProperty('as');
        expect(constructor.validator).not.toHaveProperty('t');
        expect(constructor.schema).toBe(obj);
        // Check the instance
        expect(constructor.validator.s).toBeInstanceOf(validation.StringValidator);
        expect(constructor.validator.n).toBeInstanceOf(validation.NumberValidator);
        expect(constructor.validator.b).toBeInstanceOf(validation.BooleanValidator);
        expect(constructor.validator.d).toBeInstanceOf(validation.DateValidator);
        expect(Array.isArray(constructor.validator.as)).toBeTruthy();
        expect(constructor.validator.as[0]).toBeInstanceOf(validation.StringValidator);
    });

    describe('VALIDATION', () => {

        test('Test a basic validation system', async () => {
            const data = {s: 'Element', n: '15', other: 's', b: {s: 'Hello'}}
            const obj: any = {
                s: {
                    type: String,
                    min: 5,
                    max: 20,
                    toUppercase: true
                },
                n: {
                    type: Number,
                    isPositive: true
                },
                b: {
                    s: {
                        type: String,
                        required: true
                    }
                }
            }
            const constructor = new validation.ConstructorValidator(obj);
            let response = await constructor.validate(data);
            expect(response).toHaveProperty('s');
            expect(response).toHaveProperty('n');
            expect(response).not.toHaveProperty('other');
            expect(typeof response.n).toBe('number');
            expect(response.s).toBe(data.s.toUpperCase());

            response = await constructor.validate(data, false);
            expect(response).toHaveProperty('s');
            expect(response).toHaveProperty('n');
            expect(response).toHaveProperty('other');
            expect(typeof response.n).toBe('number');
            expect(response.s).toBe(data.s.toUpperCase());
        });

        test('Should catch the good array of errors', async () => {
            const data = {s: 'Element', n: '-15', other: 's'};
            obj = {
                s: {
                    type: String,
                    min: 0,
                    max: 5,
                    toUppercase: true
                },
                n: {
                    type: Number,
                    isPositive: true
                }
            }
            constructor = new validation.ConstructorValidator(obj);
            await constructor.validate(data).catch((err: any) => {
                expect(err.length).toBe(2);
                expect(err[0].name).toBe('max');
                expect(err[1].name).toBe('min');
            });
        })
    })

    describe('ARRAY', () => {

        test('If array is empty and no value is required', async () => {
            const baseSchema: any = { arr: [{ type: String }] };
            const constructor: validation.ConstructorValidator<{arr: any[]}> = new validation.ConstructorValidator<{arr: any[]}>(baseSchema);

            const value0 = await constructor.validate({});
            const value1 = await constructor.validate({arr: []});
            const value2 = await constructor.validate({arr: [5]});
            const value3 = await constructor.validate({arr: ['10']});
            expect(value0.arr).not.toBeDefined();
            expect(value1.arr.length).toBe(0);
            expect(value2.arr[0]).toBe('5');
            expect(value3.arr[0]).toBe('10');
        })

        test('If array is empty, value is required but there is a default value', async () => {
            const baseSchema: any = { arr: [{ type: String, required: true, default: '1' }] };
            const constructor: validation.ConstructorValidator<{arr: any[]}> =  new validation.ConstructorValidator<{arr: any[]}>(baseSchema);

            const value0 = await constructor.validate({});
            const value1 = await constructor.validate({arr: []});
            const value2 = await constructor.validate({arr: [5]});
            const value3 = await constructor.validate({arr: ['10']});
            expect(value0.arr[0]).toBe(baseSchema.arr[0].default);
            expect(value1.arr[0]).toBe(baseSchema.arr[0].default);
            expect(value2.arr[0]).toBe('5');
            expect(value3.arr[0]).toBe('10');
        })

        test('If array is empty, value is required', async () => {
            let baseSchema: any = { arr: [{ type: String, required: true }] };
            let constructor: validation.ConstructorValidator<{arr: any[]}> =  new validation.ConstructorValidator<{arr: any[]}>(baseSchema);

            try {
                await constructor.validate({});
                expect(0).toBe(1)
            } catch(err: any) {
                expect(err.length).toBeGreaterThan(0);
            }

            try {
                await constructor.validate({arr: []});
                expect(0).toBe(1)
            } catch(err: any) {
                expect(err.length).toBeGreaterThan(0);
            }
        })
    });

    describe('STRING', () => {
        test('Test if each properties is set correctly and with the good params', () => {
            obj = {
                s: {type: String, default: 's'}
            };
            constructor = new validation.ConstructorValidator(obj);
            const stringConstructor: validation.StringValidator = constructor.validator.s;
            const stringSchema: any = obj.s;

            expect(stringConstructor.type).toBe('string');
            expect(stringConstructor.nullable).toBeTruthy();
            expect(stringConstructor.defaultValue).toBe(stringSchema.default);
        });

        test('#Min', () => {
            const testMinSchema = {s:{type: String, min: 5}};
            let testMinConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMinSchema);
            expect(testMinConstructor.validator.s.tests.length).toBe(1);
            expect(testMinConstructor.validator.s.transforms.length).toBe(0);
            let testMin = getTests('min', testMinConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMin).not.toBeUndefined();
            expect(testMin.args.min).toBe(testMinSchema.s.min);

            // Set an error message to the test
            const testMinSchemaError = {s:{type: String, min: [5, 'Min message']}};
            testMinConstructor = new validation.ConstructorValidator(testMinSchemaError);
            expect(testMinConstructor.validator.s.tests.length).toBe(1);
            testMin = getTests('min', testMinConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMin).not.toBeUndefined();
            expect(testMin.args.min).toBe(testMinSchemaError.s.min[0]);
            expect(testMin.message).toBe(testMinSchemaError.s.min[1]);
        })

        test('#MinLength', () => {
            const testMinLengthSchema = {s:{type: String, minlength: 5}};
            let testMinLengthConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMinLengthSchema);
            expect(testMinLengthConstructor.validator.s.tests.length).toBe(1);
            expect(testMinLengthConstructor.validator.s.transforms.length).toBe(0);
            let testMinLength = getTests('min', testMinLengthConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMinLength).not.toBeUndefined();
            expect(testMinLength.args.min).toBe(testMinLengthSchema.s.minlength);

            // Set an error message to the test
            const testMinLengthSchemaError = {s:{type: String, minlength: [5, 'MinLength message']}};
            testMinLengthConstructor = new validation.ConstructorValidator(testMinLengthSchemaError);
            expect(testMinLengthConstructor.validator.s.tests.length).toBe(1);
            testMinLength = getTests('min', testMinLengthConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMinLength).not.toBeUndefined();
            expect(testMinLength.args.min).toBe(testMinLengthSchemaError.s.minlength[0]);
            expect(testMinLength.message).toBe(testMinLengthSchemaError.s.minlength[1]);
        })

        test('#StrictMin', () => {
            const testStrictMinSchema = {s:{type: String, strictMin: 5}};
            let testStrictMinConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testStrictMinSchema);
            expect(testStrictMinConstructor.validator.s.tests.length).toBe(1);
            expect(testStrictMinConstructor.validator.s.transforms.length).toBe(0);
            let testStrictMin = getTests('strictMin', testStrictMinConstructor.validator.s.tests)[0];
            // Test default test
            expect(testStrictMin).not.toBeUndefined();
            expect(testStrictMin.args.min).toBe(testStrictMinSchema.s.strictMin);

            // Set an error message to the test
            const testStrictMinSchemaError = {s:{type: String, strictMin: [5, 'StrictMin message']}};
            testStrictMinConstructor = new validation.ConstructorValidator(testStrictMinSchemaError);
            expect(testStrictMinConstructor.validator.s.tests.length).toBe(1);
            testStrictMin = getTests('strictMin', testStrictMinConstructor.validator.s.tests)[0];
            // Test default test
            expect(testStrictMin).not.toBeUndefined();
            expect(testStrictMin.args.min).toBe(testStrictMinSchemaError.s.strictMin[0]);
            expect(testStrictMin.message).toBe(testStrictMinSchemaError.s.strictMin[1]);
        })

        test('#Max', () => {
            const testMaxSchema = {s:{type: String, max: 5}};
            let testMaxConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMaxSchema);
            expect(testMaxConstructor.validator.s.tests.length).toBe(1);
            expect(testMaxConstructor.validator.s.transforms.length).toBe(0);
            let testMax = getTests('max', testMaxConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMax).not.toBeUndefined();
            expect(testMax.args.max).toBe(testMaxSchema.s.max);

            // Set an error message to the test
            const testMaxSchemaError = {s:{type: String, max: [5, 'Max message']}};
            testMaxConstructor = new validation.ConstructorValidator(testMaxSchemaError);
            expect(testMaxConstructor.validator.s.tests.length).toBe(1);
            testMax = getTests('max', testMaxConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMax).not.toBeUndefined();
            expect(testMax.args.max).toBe(testMaxSchemaError.s.max[0]);
            expect(testMax.message).toBe(testMaxSchemaError.s.max[1]);
        })

        test('#MaxLength', () => {
            const testMaxLengthSchema = {s:{type: String, maxlength: 5}};
            let testMaxLengthConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMaxLengthSchema);
            expect(testMaxLengthConstructor.validator.s.tests.length).toBe(1);
            expect(testMaxLengthConstructor.validator.s.transforms.length).toBe(0);
            let testMaxLength = getTests('max', testMaxLengthConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMaxLength).not.toBeUndefined();
            expect(testMaxLength.args.max).toBe(testMaxLengthSchema.s.maxlength);

            // Set an error message to the test
            const testMaxLengthSchemaError = {s:{type: String, maxlength: [5, 'MaxLength message']}};
            testMaxLengthConstructor = new validation.ConstructorValidator(testMaxLengthSchemaError);
            expect(testMaxLengthConstructor.validator.s.tests.length).toBe(1);
            testMaxLength = getTests('max', testMaxLengthConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMaxLength).not.toBeUndefined();
            expect(testMaxLength.args.max).toBe(testMaxLengthSchemaError.s.maxlength[0]);
            expect(testMaxLength.message).toBe(testMaxLengthSchemaError.s.maxlength[1]);
        })

        test('#StrictMax', () => {
            const testStrictMaxSchema = {s:{type: String, strictMax: 5}};
            let testStrictMaxConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testStrictMaxSchema);
            expect(testStrictMaxConstructor.validator.s.tests.length).toBe(1);
            expect(testStrictMaxConstructor.validator.s.transforms.length).toBe(0);
            let testStrictMax = getTests('strictMax', testStrictMaxConstructor.validator.s.tests)[0];
            // Test default test
            expect(testStrictMax).not.toBeUndefined();
            expect(testStrictMax.args.max).toBe(testStrictMaxSchema.s.strictMax);

            // Set an error message to the test
            const testStrictMaxSchemaError = {s:{type: String, strictMax: [5, 'StrictMax message']}};
            testStrictMaxConstructor = new validation.ConstructorValidator(testStrictMaxSchemaError);
            expect(testStrictMaxConstructor.validator.s.tests.length).toBe(1);
            testStrictMax = getTests('strictMax', testStrictMaxConstructor.validator.s.tests)[0];
            // Test default test
            expect(testStrictMax).not.toBeUndefined();
            expect(testStrictMax.args.max).toBe(testStrictMaxSchemaError.s.strictMax[0]);
            expect(testStrictMax.message).toBe(testStrictMaxSchemaError.s.strictMax[1]);
        })

        test('#Matches', () => {
        const testMatchesSchema = {s:{type: String, matches: /.+/g}};
            let testMatchesConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMatchesSchema);
            expect(testMatchesConstructor.validator.s.tests.length).toBe(1);
            expect(testMatchesConstructor.validator.s.transforms.length).toBe(0);
            let testMatches = getTests('matches', testMatchesConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMatches).not.toBeUndefined();
            expect(testMatches.args.regex).toBe(testMatchesSchema.s.matches);

            // Set an error message to the test
            const testMatchesSchemaError = {s:{type: String, matches: [/.+/g, 'Max message']}};
            testMatchesConstructor = new validation.ConstructorValidator(testMatchesSchemaError);
            expect(testMatchesConstructor.validator.s.tests.length).toBe(1);
            testMatches = getTests('matches', testMatchesConstructor.validator.s.tests)[0];
            // Test default test
            expect(testMatches).not.toBeUndefined();
            expect(testMatches.args.regex).toBe(testMatchesSchemaError.s.matches[0]);
            expect(testMatches.message).toBe(testMatchesSchemaError.s.matches[1]);
        })

        test('#IsEmail', () => {
            let testIsEmailSchema = {s:{type: String, isEmail: false}};
            let testIsEmailConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsEmailSchema);
            expect(testIsEmailConstructor.validator.s.tests.length).toBe(0);
            expect(testIsEmailConstructor.validator.s.transforms.length).toBe(0);
            let testIsEmail = getTests('matches', testIsEmailConstructor.validator.s.tests)[0];
            expect(testIsEmail).toBeUndefined();

            testIsEmailSchema = {s:{type: String, isEmail: true}};
            testIsEmailConstructor = new validation.ConstructorValidator(testIsEmailSchema);
            expect(testIsEmailConstructor.validator.s.tests.length).toBe(1);
            expect(testIsEmailConstructor.validator.s.transforms.length).toBe(0);
            testIsEmail = getTests('matches', testIsEmailConstructor.validator.s.tests)[0];
            expect(testIsEmail).not.toBeUndefined();
            expect(testIsEmail.args.regex).toBeInstanceOf(RegExp);

            let testIsEmailArrSchema = {s:{type: String, isEmail: [false, 'IsEmail message']}};
            testIsEmailConstructor = new validation.ConstructorValidator(testIsEmailArrSchema);
            expect(testIsEmailConstructor.validator.s.tests.length).toBe(0);
            expect(testIsEmailConstructor.validator.s.transforms.length).toBe(0);
            testIsEmail = getTests('matches', testIsEmailConstructor.validator.s.tests)[0];
            expect(testIsEmail).toBeUndefined();

            testIsEmailArrSchema = {s:{type: String, isEmail: [true, 'IsEmail message']}};
            testIsEmailConstructor = new validation.ConstructorValidator(testIsEmailArrSchema);
            expect(testIsEmailConstructor.validator.s.tests.length).toBe(1);
            expect(testIsEmailConstructor.validator.s.transforms.length).toBe(0);
            testIsEmail = getTests('matches', testIsEmailConstructor.validator.s.tests)[0];
            expect(testIsEmail).not.toBeUndefined();
            expect(testIsEmail.args.regex).toBeInstanceOf(RegExp);
            expect(testIsEmail.message).toBe(testIsEmailArrSchema.s.isEmail[1]);
        })

        test('#IsUrl', () => {
            let testIsUrlSchema = {s:{type: String, isUrl: false}};
            let testIsUrlConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsUrlSchema);
            expect(testIsUrlConstructor.validator.s.tests.length).toBe(0);
            expect(testIsUrlConstructor.validator.s.transforms.length).toBe(0);
            let testIsUrl = getTests('matches', testIsUrlConstructor.validator.s.tests)[0];
            expect(testIsUrl).toBeUndefined();

            testIsUrlSchema = {s:{type: String, isUrl: true}};
            testIsUrlConstructor = new validation.ConstructorValidator(testIsUrlSchema);
            expect(testIsUrlConstructor.validator.s.tests.length).toBe(1);
            expect(testIsUrlConstructor.validator.s.transforms.length).toBe(0);
            testIsUrl = getTests('matches', testIsUrlConstructor.validator.s.tests)[0];
            expect(testIsUrl).not.toBeUndefined();
            expect(testIsUrl.args.regex).toBeInstanceOf(RegExp);

            let testIsUrlArrSchema = {s:{type: String, isUrl: [false, 'IsUrl message']}};
            testIsUrlConstructor = new validation.ConstructorValidator(testIsUrlArrSchema);
            expect(testIsUrlConstructor.validator.s.tests.length).toBe(0);
            expect(testIsUrlConstructor.validator.s.transforms.length).toBe(0);
            testIsUrl = getTests('matches', testIsUrlConstructor.validator.s.tests)[0];
            expect(testIsUrl).toBeUndefined();

            testIsUrlArrSchema = {s:{type: String, isUrl: [true, 'IsUrl message']}};
            testIsUrlConstructor = new validation.ConstructorValidator(testIsUrlArrSchema);
            expect(testIsUrlConstructor.validator.s.tests.length).toBe(1);
            expect(testIsUrlConstructor.validator.s.transforms.length).toBe(0);
            testIsUrl = getTests('matches', testIsUrlConstructor.validator.s.tests)[0];
            expect(testIsUrl).not.toBeUndefined();
            expect(testIsUrl.args.regex).toBeInstanceOf(RegExp);
            expect(testIsUrl.message).toBe(testIsUrlArrSchema.s.isUrl[1]);
        })

        test('#Enum', () => {
            // Not set an error message
            let testEnumSchema = {s:{type: String, enum: ['s']}};
            let testEnumConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testEnumSchema);
            expect(testEnumConstructor.validator.s.tests.length).toBe(1);
            expect(testEnumConstructor.validator.s.transforms.length).toBe(0);
            let testEnum = getTests('enum', testEnumConstructor.validator.s.tests)[0];
            expect(testEnum).not.toBeUndefined();
            expect(Array.isArray(testEnum.args.enums)).toBeTruthy();
            expect(testEnum.args.enums.length).toBe(1);

            // Should not set an error message
            testEnumSchema = {s:{type: String, enum: ['s', 't']}};
            testEnumConstructor = new validation.ConstructorValidator(testEnumSchema);
            expect(testEnumConstructor.validator.s.tests.length).toBe(1);
            expect(testEnumConstructor.validator.s.transforms.length).toBe(0);
            testEnum = getTests('enum', testEnumConstructor.validator.s.tests)[0];
            expect(testEnum).not.toBeUndefined();
            expect(Array.isArray(testEnum.args.enums)).toBeTruthy();
            expect(testEnum.args.enums.length).toBe(2);
            expect(testEnum.message).not.toBe(testEnumSchema.s.enum[1]);

            // Should not set an error message
            let testEnumArraySchema = {s:{type: String, enum: [['s', 't']]}};
            testEnumConstructor = new validation.ConstructorValidator(testEnumArraySchema);
            expect(testEnumConstructor.validator.s.tests.length).toBe(1);
            expect(testEnumConstructor.validator.s.transforms.length).toBe(0);
            testEnum = getTests('enum', testEnumConstructor.validator.s.tests)[0];
            expect(testEnum).not.toBeUndefined();
            expect(Array.isArray(testEnum.args.enums)).toBeTruthy();
            expect(testEnum.args.enums.length).toBe(2);
            expect(testEnum.message).not.toBe(testEnumArraySchema.s.enum[0][1]);

            // Should set an error message
            let testEnumArraysSchema = {s:{type: String, enum: [['s', 't'], 'Enum message']}};
            testEnumConstructor = new validation.ConstructorValidator(testEnumArraysSchema);
            expect(testEnumConstructor.validator.s.tests.length).toBe(1);
            expect(testEnumConstructor.validator.s.transforms.length).toBe(0);
            testEnum = getTests('enum', testEnumConstructor.validator.s.tests)[0];
            expect(testEnum).not.toBeUndefined();
            expect(Array.isArray(testEnum.args.enums)).toBeTruthy();
            expect(testEnum.args.enums.length).toBe(2);
            expect(testEnum.message).toBe(testEnumArraysSchema.s.enum[1]);
        })

        // TRANSFORM

        test('#LowerCase', () => {
            let transformLowerCaseSchema = {s:{type: String, toLowercase: false}};
            let transformLowerCaseConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(transformLowerCaseSchema);
            expect(transformLowerCaseConstructor.validator.s.tests.length).toBe(0);
            expect(transformLowerCaseConstructor.validator.s.transforms.length).toBe(0);
            let transformLowerCase = getTransforms('toLowercase', transformLowerCaseConstructor.validator.s.transforms)[0];
            expect(transformLowerCase).toBeUndefined();

            transformLowerCaseSchema = {s:{type: String, toLowercase: true}};
            transformLowerCaseConstructor = new validation.ConstructorValidator(transformLowerCaseSchema);
            expect(transformLowerCaseConstructor.validator.s.tests.length).toBe(0);
            expect(transformLowerCaseConstructor.validator.s.transforms.length).toBe(1);
            transformLowerCase = getTransforms('toLowercase', transformLowerCaseConstructor.validator.s.transforms)[0];
            expect(transformLowerCase).not.toBeUndefined();
        })

        test('#UpperCase', () => {
            let transformUpperCaseSchema = {s:{type: String, toUppercase: false}};
            let transformUpperCaseConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(transformUpperCaseSchema);
            expect(transformUpperCaseConstructor.validator.s.tests.length).toBe(0);
            expect(transformUpperCaseConstructor.validator.s.transforms.length).toBe(0);
            let transformUpperCase = getTransforms('toUppercase', transformUpperCaseConstructor.validator.s.transforms)[0];
            expect(transformUpperCase).toBeUndefined();

            transformUpperCaseSchema = {s:{type: String, toUppercase: true}};
            transformUpperCaseConstructor = new validation.ConstructorValidator(transformUpperCaseSchema);
            expect(transformUpperCaseConstructor.validator.s.tests.length).toBe(0);
            expect(transformUpperCaseConstructor.validator.s.transforms.length).toBe(1);
            transformUpperCase = getTransforms('toUppercase', transformUpperCaseConstructor.validator.s.transforms)[0];
            expect(transformUpperCase).not.toBeUndefined();
        })

        // DEFAULT TESTS

        test('#Required', async () => {
            let testRequiredSchema = {s:{type: String, required: false}};
            let testRequiredConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testRequiredSchema);
            expect(testRequiredConstructor.validator.s.tests.length).toBe(0);
            expect(testRequiredConstructor.validator.s.transforms.length).toBe(0);
            let testRequired = getTests('required', testRequiredConstructor.validator.s.tests)[0];
            expect(testRequired).toBeUndefined();

            testRequiredSchema = {s:{type: String, required: true}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredSchema);
            expect(testRequiredConstructor.validator.s.tests.length).toBe(1);
            expect(testRequiredConstructor.validator.s.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.s.tests)[0];
            expect(testRequired).not.toBeUndefined();

            let testRequiredArrSchema = {s:{type: String, required: [false, 'Required message']}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredArrSchema);
            expect(testRequiredConstructor.validator.s.tests.length).toBe(0);
            expect(testRequiredConstructor.validator.s.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.s.tests)[0];
            expect(testRequired).toBeUndefined();

            testRequiredArrSchema = {s:{type: String, required: [true, 'Required message']}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredArrSchema);
            expect(testRequiredConstructor.validator.s.tests.length).toBe(1);
            expect(testRequiredConstructor.validator.s.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.s.tests)[0];
            expect(testRequired).not.toBeUndefined();
            expect(testRequired.message).toBe(testRequiredArrSchema.s.required[1]);
        })

        test('#NotNull', () => {
            let testNotNullSchema = {s:{type: String, notNull: false}};
            let testNotNullConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testNotNullSchema);
            expect(testNotNullConstructor.validator.s.tests.length).toBe(0);
            expect(testNotNullConstructor.validator.s.transforms.length).toBe(0);
            let testNotNull = getTests('notNull', testNotNullConstructor.validator.s.tests)[0];
            expect(testNotNull).toBeUndefined();

            testNotNullSchema = {s:{type: String, notNull: true}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullSchema);
            expect(testNotNullConstructor.validator.s.tests.length).toBe(1);
            expect(testNotNullConstructor.validator.s.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.s.tests)[0];
            expect(testNotNull).not.toBeUndefined();
            expect(testNotNullConstructor.validator.s.nullable).toBeFalsy();

            let testNotNullArrSchema = {s:{type: String, notNull: [false, 'NotNull message']}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullArrSchema);
            expect(testNotNullConstructor.validator.s.tests.length).toBe(0);
            expect(testNotNullConstructor.validator.s.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.s.tests)[0];
            expect(testNotNull).toBeUndefined();

            testNotNullArrSchema = {s:{type: String, notNull: [true, 'NotNull message']}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullArrSchema);
            expect(testNotNullConstructor.validator.s.tests.length).toBe(1);
            expect(testNotNullConstructor.validator.s.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.s.tests)[0];
            expect(testNotNull).not.toBeUndefined();
            expect(testNotNullConstructor.validator.s.nullable).toBeFalsy();
            expect(testNotNull.message).toBe(testNotNullArrSchema.s.notNull[1]);
        })

        test('#Is', () => {
            const testIsSchema = {s:{type: String, is: 's'}};
            let testIsConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsSchema);
            expect(testIsConstructor.validator.s.tests.length).toBe(1);
            expect(testIsConstructor.validator.s.transforms.length).toBe(0);
            let testIs = getTests('is', testIsConstructor.validator.s.tests)[0];
            // Test default test
            expect(testIs).not.toBeUndefined();
            expect(testIs.args.shouldBe).toBe(testIsSchema.s.is);

            // Set an error message to the test
            const testIsSchemaError = {s:{type: String, is: ['s', 'Is message']}};
            testIsConstructor = new validation.ConstructorValidator(testIsSchemaError);
            expect(testIsConstructor.validator.s.tests.length).toBe(1);
            testIs = getTests('is', testIsConstructor.validator.s.tests)[0];
            // Test default test
            expect(testIs).not.toBeUndefined();
            expect(testIs.args.shouldBe).toBe(testIsSchemaError.s.is[0]);
            expect(testIs.message).toBe(testIsSchemaError.s.is[1]);
        })
    })

    describe('NUMBER', () => {
        test('Test if each properties is set correctly and with the good params', () => {
            obj = {
                n: {type: Number, default: 0}
            };
            constructor = new validation.ConstructorValidator(obj);
            const numberConstructor: validation.NumberValidator = constructor.validator.n;
            const numberSchema: any = obj.n;

            expect(numberConstructor.type).toBe('number');
            expect(numberConstructor.nullable).toBeTruthy();
            expect(numberConstructor.defaultValue).toBe(numberSchema.default);
        });

        test('#Min', () => {
            const testMinSchema = {n:{type: Number, min: 5}};
            let testMinConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMinSchema);
            expect(testMinConstructor.validator.n.tests.length).toBe(1);
            expect(testMinConstructor.validator.n.transforms.length).toBe(0);
            let testMin = getTests('min', testMinConstructor.validator.n.tests)[0];
            // Test default test
            expect(testMin).not.toBeUndefined();
            expect(testMin.args.min).toBe(testMinSchema.n.min);

            // Set an error message to the test
            const testMinSchemaError = {n:{type: Number, min: [5, 'Min message']}};
            testMinConstructor = new validation.ConstructorValidator(testMinSchemaError);
            expect(testMinConstructor.validator.n.tests.length).toBe(1);
            testMin = getTests('min', testMinConstructor.validator.n.tests)[0];
            // Test default test
            expect(testMin).not.toBeUndefined();
            expect(testMin.args.min).toBe(testMinSchemaError.n.min[0]);
            expect(testMin.message).toBe(testMinSchemaError.n.min[1]);
        })

        test('#StrictMin', () => {
            const testStrictMinSchema = {n:{type: Number, strictMin: 5}};
            let testStrictMinConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testStrictMinSchema);
            expect(testStrictMinConstructor.validator.n.tests.length).toBe(1);
            expect(testStrictMinConstructor.validator.n.transforms.length).toBe(0);
            let testStrictMin = getTests('strictMin', testStrictMinConstructor.validator.n.tests)[0];
            // Test default test
            expect(testStrictMin).not.toBeUndefined();
            expect(testStrictMin.args.min).toBe(testStrictMinSchema.n.strictMin);

            // Set an error message to the test
            const testStrictMinSchemaError = {n:{type: Number, strictMin: [5, 'StrictMin message']}};
            testStrictMinConstructor = new validation.ConstructorValidator(testStrictMinSchemaError);
            expect(testStrictMinConstructor.validator.n.tests.length).toBe(1);
            testStrictMin = getTests('strictMin', testStrictMinConstructor.validator.n.tests)[0];
            // Test default test
            expect(testStrictMin).not.toBeUndefined();
            expect(testStrictMin.args.min).toBe(testStrictMinSchemaError.n.strictMin[0]);
            expect(testStrictMin.message).toBe(testStrictMinSchemaError.n.strictMin[1]);
        })

        test('#Max', () => {
            const testMaxSchema = {n:{type: Number, max: 5}};
            let testMaxConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMaxSchema);
            expect(testMaxConstructor.validator.n.tests.length).toBe(1);
            expect(testMaxConstructor.validator.n.transforms.length).toBe(0);
            let testMax = getTests('max', testMaxConstructor.validator.n.tests)[0];
            // Test default test
            expect(testMax).not.toBeUndefined();
            expect(testMax.args.max).toBe(testMaxSchema.n.max);

            // Set an error message to the test
            const testMaxSchemaError = {n:{type: Number, max: [5, 'Max message']}};
            testMaxConstructor = new validation.ConstructorValidator(testMaxSchemaError);
            expect(testMaxConstructor.validator.n.tests.length).toBe(1);
            testMax = getTests('max', testMaxConstructor.validator.n.tests)[0];
            // Test default test
            expect(testMax).not.toBeUndefined();
            expect(testMax.args.max).toBe(testMaxSchemaError.n.max[0]);
            expect(testMax.message).toBe(testMaxSchemaError.n.max[1]);
        })

        test('#StrictMax', () => {
            const testStrictMaxSchema = {n:{type: Number, strictMax: 5}};
            let testStrictMaxConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testStrictMaxSchema);
            expect(testStrictMaxConstructor.validator.n.tests.length).toBe(1);
            expect(testStrictMaxConstructor.validator.n.transforms.length).toBe(0);
            let testStrictMax = getTests('strictMax', testStrictMaxConstructor.validator.n.tests)[0];
            // Test default test
            expect(testStrictMax).not.toBeUndefined();
            expect(testStrictMax.args.max).toBe(testStrictMaxSchema.n.strictMax);

            // Set an error message to the test
            const testStrictMaxSchemaError = {n:{type: Number, strictMax: [5, 'StrictMax message']}};
            testStrictMaxConstructor = new validation.ConstructorValidator(testStrictMaxSchemaError);
            expect(testStrictMaxConstructor.validator.n.tests.length).toBe(1);
            testStrictMax = getTests('strictMax', testStrictMaxConstructor.validator.n.tests)[0];
            // Test default test
            expect(testStrictMax).not.toBeUndefined();
            expect(testStrictMax.args.max).toBe(testStrictMaxSchemaError.n.strictMax[0]);
            expect(testStrictMax.message).toBe(testStrictMaxSchemaError.n.strictMax[1]);
        })

        test('#IsPositive', () => {
            let testIsPositiveSchema = {n:{type: Number, isPositive: false}};
            let testIsPositiveConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsPositiveSchema);
            expect(testIsPositiveConstructor.validator.n.tests.length).toBe(0);
            expect(testIsPositiveConstructor.validator.n.transforms.length).toBe(0);
            let testIsPositive = getTests('min', testIsPositiveConstructor.validator.n.tests)[0];
            expect(testIsPositive).toBeUndefined();

            testIsPositiveSchema = {n:{type: Number, isPositive: true}};
            testIsPositiveConstructor = new validation.ConstructorValidator(testIsPositiveSchema);
            expect(testIsPositiveConstructor.validator.n.tests.length).toBe(1);
            expect(testIsPositiveConstructor.validator.n.transforms.length).toBe(0);
            testIsPositive = getTests('min', testIsPositiveConstructor.validator.n.tests)[0];
            expect(testIsPositive).not.toBeUndefined();
            expect(testIsPositive.args.min).toBe(0);

            let testIsPositiveArrSchema = {n:{type: Number, isPositive: [false, 'Required message']}};
            testIsPositiveConstructor = new validation.ConstructorValidator(testIsPositiveArrSchema);
            expect(testIsPositiveConstructor.validator.n.tests.length).toBe(0);
            expect(testIsPositiveConstructor.validator.n.transforms.length).toBe(0);
            testIsPositive = getTests('min', testIsPositiveConstructor.validator.n.tests)[0];
            expect(testIsPositive).toBeUndefined();

            testIsPositiveArrSchema = {n:{type: Number, isPositive: [true, 'Required message']}};
            testIsPositiveConstructor = new validation.ConstructorValidator(testIsPositiveArrSchema);
            expect(testIsPositiveConstructor.validator.n.tests.length).toBe(1);
            expect(testIsPositiveConstructor.validator.n.transforms.length).toBe(0);
            testIsPositive = getTests('min', testIsPositiveConstructor.validator.n.tests)[0];
            expect(testIsPositive).not.toBeUndefined();
            expect(testIsPositive.args.min).toBe(0);
            expect(testIsPositive.message).toBe(testIsPositiveArrSchema.n.isPositive[1]);
        })

        test('#IsNegative', () => {
            let testIsNegativeSchema = {n:{type: Number, isNegative: false}};
            let testIsNegativeConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsNegativeSchema);
            expect(testIsNegativeConstructor.validator.n.tests.length).toBe(0);
            expect(testIsNegativeConstructor.validator.n.transforms.length).toBe(0);
            let testIsNegative = getTests('max', testIsNegativeConstructor.validator.n.tests)[0];
            expect(testIsNegative).toBeUndefined();

            testIsNegativeSchema = {n:{type: Number, isNegative: true}};
            testIsNegativeConstructor = new validation.ConstructorValidator(testIsNegativeSchema);
            expect(testIsNegativeConstructor.validator.n.tests.length).toBe(1);
            expect(testIsNegativeConstructor.validator.n.transforms.length).toBe(0);
            testIsNegative = getTests('max', testIsNegativeConstructor.validator.n.tests)[0];
            expect(testIsNegative).not.toBeUndefined();
            expect(testIsNegative.args.max).toBe(0);

            let testIsNegativeArrSchema = {n:{type: Number, isNegative: [false, 'Required message']}};
            testIsNegativeConstructor = new validation.ConstructorValidator(testIsNegativeArrSchema);
            expect(testIsNegativeConstructor.validator.n.tests.length).toBe(0);
            expect(testIsNegativeConstructor.validator.n.transforms.length).toBe(0);
            testIsNegative = getTests('max', testIsNegativeConstructor.validator.n.tests)[0];
            expect(testIsNegative).toBeUndefined();

            testIsNegativeArrSchema = {n:{type: Number, isNegative: [true, 'Required message']}};
            testIsNegativeConstructor = new validation.ConstructorValidator(testIsNegativeArrSchema);
            expect(testIsNegativeConstructor.validator.n.tests.length).toBe(1);
            expect(testIsNegativeConstructor.validator.n.transforms.length).toBe(0);
            testIsNegative = getTests('max', testIsNegativeConstructor.validator.n.tests)[0];
            expect(testIsNegative).not.toBeUndefined();
            expect(testIsNegative.args.max).toBe(0);
            expect(testIsNegative.message).toBe(testIsNegativeArrSchema.n.isNegative[1]);
        })

        test('#IsInteger', () => {
            let testIsIntegerSchema = {n:{type: Number, isInteger: false}};
            let testIsIntegerConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsIntegerSchema);
            expect(testIsIntegerConstructor.validator.n.tests.length).toBe(0);
            expect(testIsIntegerConstructor.validator.n.transforms.length).toBe(0);
            let testIsInteger = getTests('isInteger', testIsIntegerConstructor.validator.n.tests)[0];
            expect(testIsInteger).toBeUndefined();

            testIsIntegerSchema = {n:{type: Number, isInteger: true}};
            testIsIntegerConstructor = new validation.ConstructorValidator(testIsIntegerSchema);
            expect(testIsIntegerConstructor.validator.n.tests.length).toBe(1);
            expect(testIsIntegerConstructor.validator.n.transforms.length).toBe(0);
            testIsInteger = getTests('isInteger', testIsIntegerConstructor.validator.n.tests)[0];
            expect(testIsInteger).not.toBeUndefined();

            let testIsIntegerArrSchema = {n:{type: Number, isInteger: [false, 'Required message']}};
            testIsIntegerConstructor = new validation.ConstructorValidator(testIsIntegerArrSchema);
            expect(testIsIntegerConstructor.validator.n.tests.length).toBe(0);
            expect(testIsIntegerConstructor.validator.n.transforms.length).toBe(0);
            testIsInteger = getTests('isInteger', testIsIntegerConstructor.validator.n.tests)[0];
            expect(testIsInteger).toBeUndefined();

            testIsIntegerArrSchema = {n:{type: Number, isInteger: [true, 'Required message']}};
            testIsIntegerConstructor = new validation.ConstructorValidator(testIsIntegerArrSchema);
            expect(testIsIntegerConstructor.validator.n.tests.length).toBe(1);
            expect(testIsIntegerConstructor.validator.n.transforms.length).toBe(0);
            testIsInteger = getTests('isInteger', testIsIntegerConstructor.validator.n.tests)[0];
            expect(testIsInteger).not.toBeUndefined();
            expect(testIsInteger.message).toBe(testIsIntegerArrSchema.n.isInteger[1]);
        })

        test('#IsOdd', () => {
            let testIsOddSchema = {n:{type: Number, isOdd: false}};
            let testIsOddConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsOddSchema);
            expect(testIsOddConstructor.validator.n.tests.length).toBe(0);
            expect(testIsOddConstructor.validator.n.transforms.length).toBe(0);
            let testIsOdd = getTests('isOdd', testIsOddConstructor.validator.n.tests)[0];
            expect(testIsOdd).toBeUndefined();

            testIsOddSchema = {n:{type: Number, isOdd: true}};
            testIsOddConstructor = new validation.ConstructorValidator(testIsOddSchema);
            expect(testIsOddConstructor.validator.n.tests.length).toBe(1);
            expect(testIsOddConstructor.validator.n.transforms.length).toBe(0);
            testIsOdd = getTests('isOdd', testIsOddConstructor.validator.n.tests)[0];
            expect(testIsOdd).not.toBeUndefined();

            let testIsOddArrSchema = {n:{type: Number, isOdd: [false, 'Required message']}};
            testIsOddConstructor = new validation.ConstructorValidator(testIsOddArrSchema);
            expect(testIsOddConstructor.validator.n.tests.length).toBe(0);
            expect(testIsOddConstructor.validator.n.transforms.length).toBe(0);
            testIsOdd = getTests('isOdd', testIsOddConstructor.validator.n.tests)[0];
            expect(testIsOdd).toBeUndefined();

            testIsOddArrSchema = {n:{type: Number, isOdd: [true, 'Required message']}};
            testIsOddConstructor = new validation.ConstructorValidator(testIsOddArrSchema);
            expect(testIsOddConstructor.validator.n.tests.length).toBe(1);
            expect(testIsOddConstructor.validator.n.transforms.length).toBe(0);
            testIsOdd = getTests('isOdd', testIsOddConstructor.validator.n.tests)[0];
            expect(testIsOdd).not.toBeUndefined();
            expect(testIsOdd.message).toBe(testIsOddArrSchema.n.isOdd[1]);
        })

        test('#IsEven', () => {
            let testIsEvenSchema = {n:{type: Number, isEven: false}};
            let testIsEvenConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsEvenSchema);
            expect(testIsEvenConstructor.validator.n.tests.length).toBe(0);
            expect(testIsEvenConstructor.validator.n.transforms.length).toBe(0);
            let testIsEven = getTests('isEven', testIsEvenConstructor.validator.n.tests)[0];
            expect(testIsEven).toBeUndefined();

            testIsEvenSchema = {n:{type: Number, isEven: true}};
            testIsEvenConstructor = new validation.ConstructorValidator(testIsEvenSchema);
            expect(testIsEvenConstructor.validator.n.tests.length).toBe(1);
            expect(testIsEvenConstructor.validator.n.transforms.length).toBe(0);
            testIsEven = getTests('isEven', testIsEvenConstructor.validator.n.tests)[0];
            expect(testIsEven).not.toBeUndefined();

            let testIsEvenArrSchema = {n:{type: Number, isEven: [false, 'Required message']}};
            testIsEvenConstructor = new validation.ConstructorValidator(testIsEvenArrSchema);
            expect(testIsEvenConstructor.validator.n.tests.length).toBe(0);
            expect(testIsEvenConstructor.validator.n.transforms.length).toBe(0);
            testIsEven = getTests('isEven', testIsEvenConstructor.validator.n.tests)[0];
            expect(testIsEven).toBeUndefined();

            testIsEvenArrSchema = {n:{type: Number, isEven: [true, 'Required message']}};
            testIsEvenConstructor = new validation.ConstructorValidator(testIsEvenArrSchema);
            expect(testIsEvenConstructor.validator.n.tests.length).toBe(1);
            expect(testIsEvenConstructor.validator.n.transforms.length).toBe(0);
            testIsEven = getTests('isEven', testIsEvenConstructor.validator.n.tests)[0];
            expect(testIsEven).not.toBeUndefined();
            expect(testIsEven.message).toBe(testIsEvenArrSchema.n.isEven[1]);
        })

        // DEFAULT TESTS

        test('#Required', () => {
            let testRequiredSchema = {n:{type: Number, required: false}};
            let testRequiredConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testRequiredSchema);
            expect(testRequiredConstructor.validator.n.tests.length).toBe(0);
            expect(testRequiredConstructor.validator.n.transforms.length).toBe(0);
            let testRequired = getTests('required', testRequiredConstructor.validator.n.tests)[0];
            expect(testRequired).toBeUndefined();

            testRequiredSchema = {n:{type: Number, required: true}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredSchema);
            expect(testRequiredConstructor.validator.n.tests.length).toBe(1);
            expect(testRequiredConstructor.validator.n.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.n.tests)[0];
            expect(testRequired).not.toBeUndefined();

            let testRequiredArrSchema = {n:{type: Number, required: [false, 'Required message']}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredArrSchema);
            expect(testRequiredConstructor.validator.n.tests.length).toBe(0);
            expect(testRequiredConstructor.validator.n.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.n.tests)[0];
            expect(testRequired).toBeUndefined();

            testRequiredArrSchema = {n:{type: Number, required: [true, 'Required message']}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredArrSchema);
            expect(testRequiredConstructor.validator.n.tests.length).toBe(1);
            expect(testRequiredConstructor.validator.n.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.n.tests)[0];
            expect(testRequired).not.toBeUndefined();
            expect(testRequired.message).toBe(testRequiredArrSchema.n.required[1]);
        })

        test('#NotNull', () => {
            let testNotNullSchema = {n:{type: Number, notNull: false}};
            let testNotNullConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testNotNullSchema);
            expect(testNotNullConstructor.validator.n.tests.length).toBe(0);
            expect(testNotNullConstructor.validator.n.transforms.length).toBe(0);
            let testNotNull = getTests('notNull', testNotNullConstructor.validator.n.tests)[0];
            expect(testNotNull).toBeUndefined();

            testNotNullSchema = {n:{type: Number, notNull: true}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullSchema);
            expect(testNotNullConstructor.validator.n.tests.length).toBe(1);
            expect(testNotNullConstructor.validator.n.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.n.tests)[0];
            expect(testNotNull).not.toBeUndefined();
            expect(testNotNullConstructor.validator.n.nullable).toBeFalsy();

            let testNotNullArrSchema = {n:{type: Number, notNull: [false, 'NotNull message']}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullArrSchema);
            expect(testNotNullConstructor.validator.n.tests.length).toBe(0);
            expect(testNotNullConstructor.validator.n.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.n.tests)[0];
            expect(testNotNull).toBeUndefined();

            testNotNullArrSchema = {n:{type: Number, notNull: [true, 'NotNull message']}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullArrSchema);
            expect(testNotNullConstructor.validator.n.tests.length).toBe(1);
            expect(testNotNullConstructor.validator.n.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.n.tests)[0];
            expect(testNotNull).not.toBeUndefined();
            expect(testNotNullConstructor.validator.n.nullable).toBeFalsy();
            expect(testNotNull.message).toBe(testNotNullArrSchema.n.notNull[1]);
        })

        test('#Is', () => {
            const testIsSchema = {n:{type: Number, is: 0}};
            let testIsConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsSchema);
            expect(testIsConstructor.validator.n.tests.length).toBe(1);
            expect(testIsConstructor.validator.n.transforms.length).toBe(0);
            let testIs = getTests('is', testIsConstructor.validator.n.tests)[0];
            // Test default test
            expect(testIs).not.toBeUndefined();
            expect(testIs.args.shouldBe).toBe(testIsSchema.n.is);

            // Set an error message to the test
            const testIsSchemaError = {n:{type: Number, is: [0, 'Is message']}};
            testIsConstructor = new validation.ConstructorValidator(testIsSchemaError);
            expect(testIsConstructor.validator.n.tests.length).toBe(1);
            testIs = getTests('is', testIsConstructor.validator.n.tests)[0];
            // Test default test
            expect(testIs).not.toBeUndefined();
            expect(testIs.args.shouldBe).toBe(testIsSchemaError.n.is[0]);
            expect(testIs.message).toBe(testIsSchemaError.n.is[1]);
        })
    })

    describe('BOOLEAN', () => {

        test('Test if each properties is set correctly and with the good params', () => {
            obj = {
                b: {type: Boolean, default: true}
            };
            constructor = new validation.ConstructorValidator(obj);
            const booleanConstructor: validation.BooleanValidator = constructor.validator.b;
            const booleanSchema: any = obj.b;

            expect(booleanConstructor.type).toBe('boolean');
            expect(booleanConstructor.nullable).toBeTruthy();
            expect(booleanConstructor.defaultValue).toBe(booleanSchema.default);
        });

        test('#IsTrue', () => {
            let testIsTrueSchema = {b:{type: Boolean, isTrue: false}};
            let testIsTrueConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsTrueSchema);
            expect(testIsTrueConstructor.validator.b.tests.length).toBe(0);
            expect(testIsTrueConstructor.validator.b.transforms.length).toBe(0);
            let testIsTrue = getTests('isTrue', testIsTrueConstructor.validator.b.tests)[0];
            expect(testIsTrue).toBeUndefined();

            testIsTrueSchema = {b:{type: Boolean, isTrue: true}};
            testIsTrueConstructor = new validation.ConstructorValidator(testIsTrueSchema);
            expect(testIsTrueConstructor.validator.b.tests.length).toBe(1);
            expect(testIsTrueConstructor.validator.b.transforms.length).toBe(0);
            testIsTrue = getTests('isTrue', testIsTrueConstructor.validator.b.tests)[0];
            expect(testIsTrue).not.toBeUndefined();

            let testIsTrueArrSchema = {b:{type: Boolean, isTrue: [false, 'IsTrue message']}};
            testIsTrueConstructor = new validation.ConstructorValidator(testIsTrueArrSchema);
            expect(testIsTrueConstructor.validator.b.tests.length).toBe(0);
            expect(testIsTrueConstructor.validator.b.transforms.length).toBe(0);
            testIsTrue = getTests('isTrue', testIsTrueConstructor.validator.b.tests)[0];
            expect(testIsTrue).toBeUndefined();

            testIsTrueArrSchema = {b:{type: Boolean, isTrue: [true, 'IsTrue message']}};
            testIsTrueConstructor = new validation.ConstructorValidator(testIsTrueArrSchema);
            expect(testIsTrueConstructor.validator.b.tests.length).toBe(1);
            expect(testIsTrueConstructor.validator.b.transforms.length).toBe(0);
            testIsTrue = getTests('isTrue', testIsTrueConstructor.validator.b.tests)[0];
            expect(testIsTrue).not.toBeUndefined();
            expect(testIsTrue.message).toBe(testIsTrueArrSchema.b.isTrue[1]);
        })

        test('#IsFalse', () => {
            let testIsFalseSchema = {b:{type: Boolean, isFalse: false}};
            let testIsFalseConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsFalseSchema);
            expect(testIsFalseConstructor.validator.b.tests.length).toBe(0);
            expect(testIsFalseConstructor.validator.b.transforms.length).toBe(0);
            let testIsFalse = getTests('isFalse', testIsFalseConstructor.validator.b.tests)[0];
            expect(testIsFalse).toBeUndefined();

            testIsFalseSchema = {b:{type: Boolean, isFalse: true}};
            testIsFalseConstructor = new validation.ConstructorValidator(testIsFalseSchema);
            expect(testIsFalseConstructor.validator.b.tests.length).toBe(1);
            expect(testIsFalseConstructor.validator.b.transforms.length).toBe(0);
            testIsFalse = getTests('isFalse', testIsFalseConstructor.validator.b.tests)[0];
            expect(testIsFalse).not.toBeUndefined();

            let testIsFalseArrSchema = {b:{type: Boolean, isFalse: [false, 'IsFalse message']}};
            testIsFalseConstructor = new validation.ConstructorValidator(testIsFalseArrSchema);
            expect(testIsFalseConstructor.validator.b.tests.length).toBe(0);
            expect(testIsFalseConstructor.validator.b.transforms.length).toBe(0);
            testIsFalse = getTests('isFalse', testIsFalseConstructor.validator.b.tests)[0];
            expect(testIsFalse).toBeUndefined();

            testIsFalseArrSchema = {b:{type: Boolean, isFalse: [true, 'IsFalse message']}};
            testIsFalseConstructor = new validation.ConstructorValidator(testIsFalseArrSchema);
            expect(testIsFalseConstructor.validator.b.tests.length).toBe(1);
            expect(testIsFalseConstructor.validator.b.transforms.length).toBe(0);
            testIsFalse = getTests('isFalse', testIsFalseConstructor.validator.b.tests)[0];
            expect(testIsFalse).not.toBeUndefined();
            expect(testIsFalse.message).toBe(testIsFalseArrSchema.b.isFalse[1]);
        })

        // DEFAULT TESTS

        test('#Required', () => {
            let testRequiredSchema = {b:{type: Boolean, required: false}};
            let testRequiredConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testRequiredSchema);
            expect(testRequiredConstructor.validator.b.tests.length).toBe(0);
            expect(testRequiredConstructor.validator.b.transforms.length).toBe(0);
            let testRequired = getTests('required', testRequiredConstructor.validator.b.tests)[0];
            expect(testRequired).toBeUndefined();

            testRequiredSchema = {b:{type: Boolean, required: true}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredSchema);
            expect(testRequiredConstructor.validator.b.tests.length).toBe(1);
            expect(testRequiredConstructor.validator.b.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.b.tests)[0];
            expect(testRequired).not.toBeUndefined();

            let testRequiredArrSchema = {b:{type: Boolean, required: [false, 'Required message']}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredArrSchema);
            expect(testRequiredConstructor.validator.b.tests.length).toBe(0);
            expect(testRequiredConstructor.validator.b.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.b.tests)[0];
            expect(testRequired).toBeUndefined();

            testRequiredArrSchema = {b:{type: Boolean, required: [true, 'Required message']}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredArrSchema);
            expect(testRequiredConstructor.validator.b.tests.length).toBe(1);
            expect(testRequiredConstructor.validator.b.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.b.tests)[0];
            expect(testRequired).not.toBeUndefined();
            expect(testRequired.message).toBe(testRequiredArrSchema.b.required[1]);
        })

        test('#NotNull', () => {
            let testNotNullSchema = {b:{type: Boolean, notNull: false}};
            let testNotNullConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testNotNullSchema);
            expect(testNotNullConstructor.validator.b.tests.length).toBe(0);
            expect(testNotNullConstructor.validator.b.transforms.length).toBe(0);
            let testNotNull = getTests('notNull', testNotNullConstructor.validator.b.tests)[0];
            expect(testNotNull).toBeUndefined();

            testNotNullSchema = {b:{type: Boolean, notNull: true}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullSchema);
            expect(testNotNullConstructor.validator.b.tests.length).toBe(1);
            expect(testNotNullConstructor.validator.b.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.b.tests)[0];
            expect(testNotNull).not.toBeUndefined();
            expect(testNotNullConstructor.validator.b.nullable).toBeFalsy();

            let testNotNullArrSchema = {b:{type: Boolean, notNull: [false, 'NotNull message']}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullArrSchema);
            expect(testNotNullConstructor.validator.b.tests.length).toBe(0);
            expect(testNotNullConstructor.validator.b.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.b.tests)[0];
            expect(testNotNull).toBeUndefined();

            testNotNullArrSchema = {b:{type: Boolean, notNull: [true, 'NotNull message']}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullArrSchema);
            expect(testNotNullConstructor.validator.b.tests.length).toBe(1);
            expect(testNotNullConstructor.validator.b.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.b.tests)[0];
            expect(testNotNull).not.toBeUndefined();
            expect(testNotNullConstructor.validator.b.nullable).toBeFalsy();
            expect(testNotNull.message).toBe(testNotNullArrSchema.b.notNull[1]);
        })

        test('#Is', () => {
            const testIsSchema = {b:{type: Boolean, is: true}};
            let testIsConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsSchema);

            expect(testIsConstructor.validator.b.tests.length).toBe(1);
            expect(testIsConstructor.validator.b.transforms.length).toBe(0);
            let testIs = getTests('is', testIsConstructor.validator.b.tests)[0];
            // Test default test
            expect(testIs).not.toBeUndefined();
            expect(testIs.args.shouldBe).toBe(testIsSchema.b.is);

            // Set an error message to the test
            const testIsSchemaError = {b:{type: Boolean, is: [true, 'Is message']}};
            testIsConstructor = new validation.ConstructorValidator(testIsSchemaError);
            expect(testIsConstructor.validator.b.tests.length).toBe(1);
            testIs = getTests('is', testIsConstructor.validator.b.tests)[0];
            // Test default test
            expect(testIs).not.toBeUndefined();
            expect(testIs.args.shouldBe).toBe(testIsSchemaError.b.is[0]);

            expect(testIs.message).toBe(testIsSchemaError.b.is[1]);
        })
    })

    describe('DATE', () => {
        const Dt = new Date();

        test('Test if each properties is set correctly and with the good params', () => {
            obj = {
                d: {type: Date, default: new Date()}
            };
            const constructor: validation.ConstructorValidator = new validation.ConstructorValidator(obj);
            const dateConstructor: validation.DateValidator = constructor.validator.d;

            expect(dateConstructor.type).toBe('date');
            expect(dateConstructor.nullable).toBeTruthy();
            expect(dateConstructor.defaultValue).toBeInstanceOf(Date);
        });

        test('#Min', () => {
            const testMinSchema = {d:{type: Date, min: Dt}};
            let testMinConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMinSchema);
            expect(testMinConstructor.validator.d.tests.length).toBe(1);
            expect(testMinConstructor.validator.d.transforms.length).toBe(0);
            let testMin = getTests('min', testMinConstructor.validator.d.tests)[0];
            // Test default test
            expect(testMin).not.toBeUndefined();
            expect(testMin.args.min).toBeInstanceOf(Date);

            // Set an error message to the test
            const testMinSchemaError = {d:{type: Date, min: [Dt, 'Min message']}};
            testMinConstructor = new validation.ConstructorValidator(testMinSchemaError);
            expect(testMinConstructor.validator.d.tests.length).toBe(1);
            testMin = getTests('min', testMinConstructor.validator.d.tests)[0];
            // Test default test
            expect(testMin).not.toBeUndefined();
            expect(testMin.args.min).toBeInstanceOf(Date);
            expect(testMin.message).toBe(testMinSchemaError.d.min[1]);
        })

        test('#StrictMin', () => {
            const testStrictMinSchema = {d:{type: Date, strictMin: Dt}};
            let testStrictMinConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testStrictMinSchema);
            expect(testStrictMinConstructor.validator.d.tests.length).toBe(1);
            expect(testStrictMinConstructor.validator.d.transforms.length).toBe(0);
            let testStrictMin = getTests('strictMin', testStrictMinConstructor.validator.d.tests)[0];
            // Test default test
            expect(testStrictMin).not.toBeUndefined();
            expect(testStrictMin.args.min).toBeInstanceOf(Date);

            // Set an error message to the test
            const testStrictMinSchemaError = {d:{type: Date, strictMin: [Dt, 'StrictMin message']}};
            testStrictMinConstructor = new validation.ConstructorValidator(testStrictMinSchemaError);
            expect(testStrictMinConstructor.validator.d.tests.length).toBe(1);
            testStrictMin = getTests('strictMin', testStrictMinConstructor.validator.d.tests)[0];
            // Test default test
            expect(testStrictMin).not.toBeUndefined();
            expect(testStrictMin.args.min).toBeInstanceOf(Date);
            expect(testStrictMin.message).toBe(testStrictMinSchemaError.d.strictMin[1]);
        })

        test('#Max', () => {
            const testMaxSchema = {d:{type: Date, max: Dt}};
            let testMaxConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testMaxSchema);
            expect(testMaxConstructor.validator.d.tests.length).toBe(1);
            expect(testMaxConstructor.validator.d.transforms.length).toBe(0);
            let testMax = getTests('max', testMaxConstructor.validator.d.tests)[0];
            // Test default test
            expect(testMax).not.toBeUndefined();
            expect(testMax.args.max).toBeInstanceOf(Date);

            // Set an error message to the test
            const testMaxSchemaError = {d:{type: Date, max: [Dt, 'Max message']}};
            testMaxConstructor = new validation.ConstructorValidator(testMaxSchemaError);
            expect(testMaxConstructor.validator.d.tests.length).toBe(1);
            testMax = getTests('max', testMaxConstructor.validator.d.tests)[0];
            // Test default test
            expect(testMax).not.toBeUndefined();
            expect(testMax.args.max).toBeInstanceOf(Date);
            expect(testMax.message).toBe(testMaxSchemaError.d.max[1]);
        })

        test('#StrictMax', () => {
            const testStrictMaxSchema = {d:{type: Date, strictMax: Dt}};
            let testStrictMaxConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testStrictMaxSchema);
            expect(testStrictMaxConstructor.validator.d.tests.length).toBe(1);
            expect(testStrictMaxConstructor.validator.d.transforms.length).toBe(0);
            let testStrictMax = getTests('strictMax', testStrictMaxConstructor.validator.d.tests)[0];
            // Test default test
            expect(testStrictMax).not.toBeUndefined();
            expect(testStrictMax.args.max).toBeInstanceOf(Date);

            // Set an error message to the test
            const testStrictMaxSchemaError = {d:{type: Date, strictMax: [Dt, 'StrictMax message']}};
            testStrictMaxConstructor = new validation.ConstructorValidator(testStrictMaxSchemaError);
            expect(testStrictMaxConstructor.validator.d.tests.length).toBe(1);
            testStrictMax = getTests('strictMax', testStrictMaxConstructor.validator.d.tests)[0];
            // Test default test
            expect(testStrictMax).not.toBeUndefined();
            expect(testStrictMax.args.max).toBeInstanceOf(Date);
            expect(testStrictMax.message).toBe(testStrictMaxSchemaError.d.strictMax[1]);
        })

        // DEFAULT TESTS

        test('#Required', () => {
            let testRequiredSchema = {d:{type: Date, required: false}};
            let testRequiredConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testRequiredSchema);
            expect(testRequiredConstructor.validator.d.tests.length).toBe(0);
            expect(testRequiredConstructor.validator.d.transforms.length).toBe(0);
            let testRequired = getTests('required', testRequiredConstructor.validator.d.tests)[0];
            expect(testRequired).toBeUndefined();

            testRequiredSchema = {d:{type: Date, required: true}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredSchema);
            expect(testRequiredConstructor.validator.d.tests.length).toBe(1);
            expect(testRequiredConstructor.validator.d.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.d.tests)[0];
            expect(testRequired).not.toBeUndefined();

            let testRequiredArrSchema = {d:{type: Date, required: [false, 'Required message']}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredArrSchema);
            expect(testRequiredConstructor.validator.d.tests.length).toBe(0);
            expect(testRequiredConstructor.validator.d.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.d.tests)[0];
            expect(testRequired).toBeUndefined();

            testRequiredArrSchema = {d:{type: Date, required: [true, 'Required message']}};
            testRequiredConstructor = new validation.ConstructorValidator(testRequiredArrSchema);
            expect(testRequiredConstructor.validator.d.tests.length).toBe(1);
            expect(testRequiredConstructor.validator.d.transforms.length).toBe(0);
            testRequired = getTests('required', testRequiredConstructor.validator.d.tests)[0];
            expect(testRequired).not.toBeUndefined();
            expect(testRequired.message).toBe(testRequiredArrSchema.d.required[1]);
        })

        test('#NotNull', () => {
            let testNotNullSchema = {d:{type: Date, notNull: false}};
            let testNotNullConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testNotNullSchema);
            expect(testNotNullConstructor.validator.d.tests.length).toBe(0);
            expect(testNotNullConstructor.validator.d.transforms.length).toBe(0);
            let testNotNull = getTests('notNull', testNotNullConstructor.validator.d.tests)[0];
            expect(testNotNull).toBeUndefined();

            testNotNullSchema = {d:{type: Date, notNull: true}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullSchema);
            expect(testNotNullConstructor.validator.d.tests.length).toBe(1);
            expect(testNotNullConstructor.validator.d.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.d.tests)[0];
            expect(testNotNull).not.toBeUndefined();
            expect(testNotNullConstructor.validator.d.nullable).toBeFalsy();

            let testNotNullArrSchema = {d:{type: Date, notNull: [false, 'NotNull message']}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullArrSchema);
            expect(testNotNullConstructor.validator.d.tests.length).toBe(0);
            expect(testNotNullConstructor.validator.d.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.d.tests)[0];
            expect(testNotNull).toBeUndefined();

            testNotNullArrSchema = {d:{type: Date, notNull: [true, 'NotNull message']}};
            testNotNullConstructor = new validation.ConstructorValidator(testNotNullArrSchema);
            expect(testNotNullConstructor.validator.d.tests.length).toBe(1);
            expect(testNotNullConstructor.validator.d.transforms.length).toBe(0);
            testNotNull = getTests('notNull', testNotNullConstructor.validator.d.tests)[0];
            expect(testNotNull).not.toBeUndefined();
            expect(testNotNullConstructor.validator.d.nullable).toBeFalsy();
            expect(testNotNull.message).toBe(testNotNullArrSchema.d.notNull[1]);
        })

        test('#Is', () => {
            const testIsSchema = {d:{type: Date, is: new Date()}};
            let testIsConstructor: validation.ConstructorValidator = new validation.ConstructorValidator(testIsSchema);
            expect(testIsConstructor.validator.d.tests.length).toBe(1);
            expect(testIsConstructor.validator.d.transforms.length).toBe(0);
            let testIs = getTests('is', testIsConstructor.validator.d.tests)[0];
            // Test default test
            expect(testIs).not.toBeUndefined();
            expect(testIs.args.shouldBe.getTime()).toBe(testIsSchema.d.is.getTime());

            // Set an error message to the test
            const testIsSchemaError = {d:{type: Date, is: [new Date(), 'Is message']}};
            testIsConstructor = new validation.ConstructorValidator(testIsSchemaError);
            expect(testIsConstructor.validator.d.tests.length).toBe(1);
            testIs = getTests('is', testIsConstructor.validator.d.tests)[0];
            // Test default test
            expect(testIs).not.toBeUndefined();
            expect(testIs.args.shouldBe.getTime()).toBe(new Date(testIsSchemaError.d.is[0]).getTime());
            expect(testIs.message).toBe(testIsSchemaError.d.is[1]);
        })
    })
});