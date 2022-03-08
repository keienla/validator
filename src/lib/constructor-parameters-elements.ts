export interface StringConstructorInterface {
    type: StringConstructor,
    min?: number | [number, string],
    minlength?: number | [number, string],
    strictMin?: number | [number, string],
    max?: number | [number, string],
    maxlength?: number | [number, string],
    strictMax?: number | [number, string],
    toLowercase?: boolean,
    toUppercase?: boolean,
    matches?: RegExp | [RegExp, string],
    enum?: string[] | [string[], string],
    isEmail?: boolean | [boolean, string],
    isUrl?: boolean | [boolean, string],
    required?: boolean | [boolean, string],
    notNull?: boolean | [boolean, string],
    is?: string | [string, string],
    default?: string
}

export type StringConstructorType = StringConstructorInterface | StringConstructor;

export interface NumberConstructorInterface {
    type: NumberConstructor,
    min?: number | [number, string],
    strictMin?: number | [number, string],
    max?: number | [number, string],
    strictMax?: number | [number, string],
    isPositive?: boolean | [boolean, string],
    isNegative?: boolean | [boolean, string],
    isInteger?: boolean | [boolean, string],
    isOdd?: boolean | [boolean, string],
    isEven?: boolean | [boolean, string],
    required?: boolean | [boolean, string],
    notNull?: boolean | [boolean, string],
    is?: number | [number, string],
    default?: number
}

export type NumberConstructorType = NumberConstructorInterface | NumberConstructor;

export interface BooleanConstructorInterface {
    type: BooleanConstructor,
    isTrue?: boolean | [boolean, string],
    isFalse?: boolean | [boolean, string],
    required?: boolean | [boolean, string],
    notNull?: boolean | [boolean, string],
    is?: boolean | [boolean, string],
    default?: boolean
}

export type BooleanConstructorType = BooleanConstructorInterface | BooleanConstructor;

export interface DateConstructorInterface {
    type: DateConstructor,
    min?: number | [number, string],
    strictMin?: number | [number, string],
    max?: number | [number, string],
    strictMax?: number | [number, string],
    required?: boolean | [boolean, string],
    notNull?: boolean | [boolean, string],
    is?: Date | [Date, string],
    default?: Date
}

export type DateConstructorType = DateConstructorInterface | DateConstructor;