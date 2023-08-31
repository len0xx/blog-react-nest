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
        string: {
            type: 'string'
        },
        number: {
            type: 'number'
        },
        array: {
            type: 'array'
        },
        undefined: {
            type: 'undefined'
        },
        object: {
            type: 'object'
        },
        symbol: {
            type: 'symbol'
        },
        bigint: {
            type: 'bigint'
        },
        boolean: {
            type: 'boolean'
        }
    }

    expect(validateSchema(schema, values))
})

test('null is an object', () => {
    const values = {
        null: null
    }

    const schema: ValidationSchema = {
        null: {
            type: 'object'
        }
    }

    expect(validateSchema(schema, values))
})

test('new Array() is an array', () => {
    const values = {
        array: new Array(10)
    }

    const schema: ValidationSchema = {
        array: {
            type: 'array'
        }
    }

    expect(() => validateSchema(schema, values))
})

test('String created from a constructor is an object, not a primitive', () => {
    const values = {
        string: new String('Hello')
    }

    const schema: ValidationSchema = {
        string: {
            type: 'string'
        }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Number created from a constructor is an object, not a primitive', () => {
    const values = {
        number: new Number(123)
    }

    const schema: ValidationSchema = {
        number: {
            type: 'number'
        }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect string type', () => {
    const values = {
        string: Symbol('a')
    }

    const schema: ValidationSchema = {
        string: {
            type: 'string'
        }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect number type', () => {
    const values = {
        number: BigInt(3000000000)
    }

    const schema: ValidationSchema = {
        number: {
            type: 'number'
        }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect boolean type', () => {
    const values = {
        boolean: null
    }

    const schema: ValidationSchema = {
        boolean: {
            type: 'boolean'
        }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect array type', () => {
    const values = {
        array: Buffer.from('Hello world')
    }

    const schema: ValidationSchema = {
        array: {
            type: 'array'
        }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})

test('Incorrect object type', () => {
    const values = {
        object: 'test'
    }

    const schema: ValidationSchema = {
        object: {
            type: 'object'
        }
    }

    expect(() => validateSchema(schema, values)).toThrowError(ValidationError)
})
