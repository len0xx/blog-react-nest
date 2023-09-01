import { expect, test } from 'vitest'
import { ValidationError, ValidationSchema, validateSchema } from '@/util'

test('Correct types validation', () => {
    const values = {
        string: 'Hello',
        number: 123,
        array: [ 20, 30, 40 ],
        undefined: undefined,
        object: { a: 2 },
        symbol: Symbol('\\'),
        bigint: BigInt(3000000000),
        boolean: false
    }

    const schema: ValidationSchema = {
        string: { type: 'string' },
        number: { type: 'number' },
        array: { type: 'array' },
        undefined: { type: 'undefined' },
        object: { type: 'object' },
        symbol: { type: 'symbol' },
        bigint: { type: 'bigint' },
        boolean: { type: 'boolean' }
    }

    expect(validateSchema(schema, values))
})

test('null is an object', () => {
    const values = { null: null }

    const schema: ValidationSchema = {
        null: { type: 'object' }
    }

    expect(validateSchema(schema, values))
})

test('new Array() is an array', () => {
    const values = { array: new Array(10) }

    const schema: ValidationSchema = {
        array: { type: 'array' }
    }

    expect(() => validateSchema(schema, values))
})

test('String created from a constructor is an object, not a primitive', () => {
    const values = { string: new String('Hello') }

    const schema: ValidationSchema = {
        string: { type: 'string' }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Number created from a constructor is an object, not a primitive', () => {
    const values = { number: new Number(123) }

    const schema: ValidationSchema = {
        number: { type: 'number' }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect string type', () => {
    const values = { string: Symbol('a') }

    const schema: ValidationSchema = {
        string: { type: 'string' }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect number type', () => {
    const values = { number: BigInt(3000000000) }

    const schema: ValidationSchema = {
        number: { type: 'number' }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect boolean type', () => {
    const values = { boolean: null }

    const schema: ValidationSchema = {
        boolean: { type: 'boolean' }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect array type', () => {
    const values = { array: Buffer.from('Hello world') }

    const schema: ValidationSchema = {
        array: { type: 'array' }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect object type', () => {
    const values = { object: 'test' }

    const schema: ValidationSchema = {
        object: { type: 'object' }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Required rule', () => {
    const schema: ValidationSchema = {
        test: { required: true },
        foo: { required: false }
    }

    const correctValues = {
        test: 123,
        foo: 234
    }

    const incorrectValues = {
        test2: 444
    }

    expect(validateSchema(schema, correctValues))
    expect(() => validateSchema(schema, incorrectValues)).toThrowError(ValidationError)
})

test('Numeric string', () => {
    const schema: ValidationSchema = {
        test: { isNumeric: true }
    }

    const correctValues = { test: '179824' }

    const incorrectValues = { test: 'f832728' }

    expect(validateSchema(schema, correctValues))
    expect(() => validateSchema(schema, incorrectValues)).toThrowError(ValidationError)
})

test('Match rule', () => {
    const schema: ValidationSchema = {
        test: { match: 'Test' },
        test2: { match: () => Math.sqrt(556346569).toString() },
        test3: { match: /[a-z]{3}/ }
    }

    const correctValues = {
        test: 'Test',
        test2: '23587',
        test3: 'abc'
    }

    const incorrectValues = {
        test: 'Hello',
        test2: '238928',
        test3: 'A-'
    }

    expect(validateSchema(schema, correctValues))
    expect(() => validateSchema(schema, incorrectValues)).toThrowError(ValidationError)
})

test('Dont match rule', () => {
    const schema: ValidationSchema = {
        test: { dontMatch: 'Test' },
        test2: { dontMatch: () => Math.sqrt(556346569).toString() }
    }

    const correctValues = {
        test: 'Hello',
        test2: '234899'
    }

    const incorrectValues = {
        test: 'Test',
        test2: '23587'
    }

    expect(validateSchema(schema, correctValues))
    expect(() => validateSchema(schema, incorrectValues)).toThrowError(ValidationError)
})

test('Contains, notContains rules', () => {
    const schema: ValidationSchema = {
        test: { contains: 'PATTERN' },
        test2: { contains: [[ '' ]] }
    }

    const correctValues = { test: '@-_PATTERN_0189' }

    const incorrectValues = { test: 'f832728' }

    expect(validateSchema(schema, correctValues))
    expect(() => validateSchema(schema, incorrectValues)).toThrowError(ValidationError)
})

test('In, notIn rules', () => {
    const schema: ValidationSchema<number> = {
        test: { isIn: [ 100, 200, 300 ] }
    }

    const correctValues = { test: 200 }

    const incorrectValues = { test: 400 }

    expect(validateSchema(schema, correctValues))
    expect(() => validateSchema(schema, incorrectValues)).toThrowError(ValidationError)
})

test('AlphaNum rule', () => {
    const schema: ValidationSchema = {
        test: { alphaNum: true },
        test1: { alphaNum: true },
        test2: { alphaNum: true },
        test3: { alphaNum: true },
        test4: { alphaNum: true },
        test5: { alphaNum: true }
    }

    const correctValues = {
        test: 'abc',
        test2: 'ac5sacjokunASyWQbj239AScaaDbh47ASDC',
        test3: '082357',
        test4: 'ACnjkdsVNJK',
        test5: 'VNSDNVNNDJD'
    }

    const incorrectValues = {
        test: '',
        test2: 'SbiVs8dl0svSKz?JV9',
        test3: '0SDVh-',
        test4: 'Тест',
        test5: '[ACsaC]'
    }

    expect(validateSchema(schema, correctValues))
    expect(() => validateSchema(schema, incorrectValues)).toThrowError(ValidationError)
})

test('Complex schema', () => {
    const custom = (input: string): boolean => {
        if (input.length === 6 && !input.startsWith('50')) {
            return false
        }
        else if (input.length === 10 && !input.startsWith('77')) {
            return false
        }
        return true
    }

    const schema: ValidationSchema<string> = {
        foo: {
            type: 'string',
            required: true,
            minLen: 6,
            maxLen: 30,
            dontMatch: 'FORBIDDEN',
            customValidation: custom,
            alphaNum: true,
            errorText: 'The validation failed'
        }
    }

    const correctValues = { foo: '5060AH' }

    const incorrectValues: Record<string, string | number>[] = [
        { foo: 'FORBIDDEN' },
        { foo: '606060' },
        { foo: '123' },
        { foo: 1234342 },
        { foo: '5050505050' },
        { foo2: '5060AH' }
    ]

    expect(validateSchema(schema, correctValues))
    expect(() => validateSchema<string | number>(schema, incorrectValues[0])).toThrowError(ValidationError)
    expect(() => validateSchema<string | number>(schema, incorrectValues[0])).toThrowError('The validation failed')
    expect(() => validateSchema<string | number>(schema, incorrectValues[1])).toThrowError(ValidationError)
    expect(() => validateSchema<string | number>(schema, incorrectValues[2])).toThrowError(ValidationError)
    expect(() => validateSchema<string | number>(schema, incorrectValues[3])).toThrowError(ValidationError)
    expect(() => validateSchema<string | number>(schema, incorrectValues[4])).toThrowError(ValidationError)
    expect(() => validateSchema<string | number>(schema, incorrectValues[5])).toThrowError(ValidationError)
})
