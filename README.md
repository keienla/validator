# ATMOS JSON VALIDATOR

Atmos validator allows to create a data validation system. This can validate a single value, an array of values and also a JSON object.

There is multiple type of object that can be validate :
* String
* Number
* Date
* Boolean

## Configuration and options of each type
### Global
* `required` *{ message?: String }*: If the element is required, throw an error if the given element is undefined, null, or for each type is the element is valid (for example, String can't be '')
* `notNull` *{ message?: String }*: Check if the element is null
* `is` *{ shouldBe: any, message?: String }*: Check if the element is equal to the shouldBe element
* `default` *{ value: any }*: give a default value to replace if the given value is undefined or null
- **required must be true if the result is undefined (else doesn't change the value of undefined into the default value)**
- **notNull must be true if the result is null (else doesn't change the value of null into the default value)**
### Sring
#### Functions for validation :
* `min` *{ min: Number, message?: String }*: Define a min length for the string
* `max` *{ max: Number, message?: String }*: Define a max length for the string
* `strictMin` *{ min: Number, message?: String }*: Define an absolute min for the string
* `strictMax` *{ max: Number, message?: String }*: Define an absolute max for the string
* `matches` *{ regex: RegExp, message?: String }*: Check a given RegExp
* `enum` *{ enums: String[], message?: String }*: Check if the String is in an array of String
* `isEmail` *{ message?: String }*: Check if the string is an email type
* `isUrl` *{ message?: String }*: Check if the String is an URL type
#### Functions for transformation :
* `toUppercase`: transform the String to a full UPPERCASE String
* `toLowercase`: transform the String to a full lowercase String
### Number
#### Functions for validation:
* `min` *{ min: Number, message?: String }*: Define a min value for the number
* `max` *{ max: Number, message?: String }*: Define a max value for the number
* `strictMin` *{ min: Number, message?: String }*: Define an absolute min value for the number
* `strictMax` *{ max: Number, message?: String }*: Define an absolute max value for the number
* `isPositive` *{ message?: String }*: Check if the number is positive
* `isNegative` *{ message?: String }*: Check if the number is negative
* `isInteger` *{ message?: String }*: Check if the number is an integer
* `isOdd` *{ message?: String }*: Check if the number is an odd number (ex: *1, 3, 5...*)
* `isEven` *{ message?: String }*: Check if the number is an even number (ex: *2, 4, 6...*)
### Date
#### Functions for validation:
* `min` *{ min: Number, message?: String }*: Define a min date
* `max` *{ max: Number, message?: String }*: Define a max date
* `strictMin` *{ min: Number, message?: String }*: Define an absolute min date
* `strictMax` *{ max: Number, message?: String }*: Define an absolute max date
### Boolean
#### Functions for validation:
* `isTrue` *{ message?: String }*: Check if the boolean is true
* `isFalse` *{ message?: String }*: Check if the boolean is false

---
## Constructor

If you want to validate a json, you can use a constructor. For each element you can define each function and parameters. For example:
```
import * as validation from '...';

const constructor = new validation.construct({
    name: String,
    value: Number
})

// constructor = {
//     name: new validation.string(),
//     value: new validation.number()
// }
```
---

But the schema can be more complexe and it could be something like this :
```
import * as validation from '...';

const schema = {
    name: {
        type: String,
        min: 0,
        max: [255, 'The max length is 255'],
        required: [true, 'The name is required']
    },
    data: {
        values: [{
            type: Number,
            default: 5,
            isPositive: true
        }],
        title: {
            type: String,
            toUppercase: true
        }
        subTitle: String
    }
}
```
With the command :
```
const constructor = new validation.construct(schema);
```
It's the same than create the constructor like this :
```
constructor = {
    name: new validation.string().min(0).max(255, 'The max length is 255').required('The name is required'),
    data: {
        values: [new validation.number().default(5).isPositive()],
        title: new validation.string().toUppercase(),
        subTitle: new validation.string()
    }
}
```
---
## Validation
To test an element it's realy easy and always return a promise.

If you want to test just one element just type :
```
import * as validation from '...';

const stringValidation = new validation.string().min(5).max(10);

try {
    stringValidation.validate(7);

    // or

    validation.validate(7, stringValidation);
} catch(err: any) {

}
```
If there is an error, the validation test will throw an error.

---

If you used a constructor or create the validation object by you own, you can use the same function to validation the object.
```
import * as validation from '...';

const constructor = new validation.construct({
    name: {
        type: String,
        min: 5,
        max: 15,
        required: true
    },
    value: {
        type: Number,
        min: 0,
        max: 1337,
        required: true
    }
})

try {
    validation.validate({
        name: 'Hello World',
        value: 10
    }, constructor);

    // or

    constructor.validate({
        name: 'Hello World',
        value: 10
    })
} catch(err: any) {

}
```

__IF THERE IS AN ERROR, THE 'ERR' IN CATCH WILL BE AN ARRAY AND WILL SHOW EACH ELEMENT OF THE OBJECT THAT HAVE AN ERROR__