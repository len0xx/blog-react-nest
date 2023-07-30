export class HTTPError extends Error {
    code: number

    constructor(code: number, message: string) {
        super(message)
        this.code = code
    }
}

export interface Post {
    id: number
    title: string
    content: string
    authorId: number
    published: boolean
}

export interface ValidationRule<T = any> {
    required?: boolean
    isNumeric?: boolean
    minLen?: number
    maxLen?: number
    minValue?: T
    maxValue?: T
    match?: T
    matchRegex?: RegExp
    contains?: string
    notContains?: string
    isIn?: T[]
    notIn?: T[]
    customValidation?: (input: T) => boolean
    errorText?: string
}

export type ValidationSchema = Record<string, ValidationRule>

export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export interface ObjectHasLength extends Object {
    length: number
}

export const validateSchema = (schema: ValidationSchema, data: Record<string, unknown>): boolean => {
    for (const key in schema) {
        const rule = schema[key]
        const val = data[key]
        const err = rule.errorText

        if (rule.required && !(typeof val === 'boolean' && val === false) && !val) {
            throw new ValidationError(err || `Field ${ key } is required by the provided schema, but value is "${ val }"`)
        }

        if (rule.isNumeric) {
            if (isNaN(+(val as number))) {
                throw new ValidationError(err || `Field ${ key } is expected to be numeric, but it's value is "${ val }"`)
            }
        }

        if (rule.minValue || typeof rule.minValue === 'number' && rule.minValue === 0) {
            if (val as number < rule.minValue) {
                throw new ValidationError(err || `Field ${ key } is expected to be greater than ${ rule.minValue }, but it's value is "${ val }"`)
            }
        }

        if (rule.maxValue || typeof rule.maxValue === 'number' && rule.maxValue === 0) {
            if (val as number > rule.maxValue) {
                throw new ValidationError(err || `Field ${ key } is expected to be less than ${ rule.maxValue }, but it's value is "${ val }"`)
            }
        }

        if (rule.minLen || rule.minLen === 0) {
            if (typeof (val as ObjectHasLength).length !== 'number') {
                throw new ValidationError(err || `Field ${ key } is expected to have at least ${ rule.minLen } elements in it, but it has no 'length' property`)
            }
            else if ((val as ObjectHasLength).length < rule.minLen) {
                throw new ValidationError(
                    err || `Field ${ key } is expected to have at least ${ rule.minLen } elements in it, but it has length of ${ (val as ObjectHasLength).length }`
                )
            }
        }

        if (rule.maxLen || rule.maxLen === 0) {
            if (typeof (val as ObjectHasLength).length !== 'number') {
                throw new ValidationError(err || `Field ${ key } is expected to have ${ rule.maxLen } elements at most in it, but it has no 'length' property`)
            }
            else if ((val as ObjectHasLength).length > rule.maxLen) {
                throw new ValidationError(
                    err || `Field ${ key } is expected to have ${ rule.maxLen } elements at most in it, but it has length of ${ (val as ObjectHasLength).length }`
                )
            }
        }

        if (rule.match && val !== rule.match) {
            throw new ValidationError(err || `Field ${ key } did not match ${ rule.match }`)
        }

        if (rule.matchRegex && !rule.matchRegex.test(val as string)) {
            throw new ValidationError(err || `Field ${ key } is expected to match the certain Regular Expression, but it does not`)
        }

        if (rule.contains && val && !(typeof val === 'string' && val.includes(rule.contains))) {
            throw new ValidationError(err || `Field ${ key } is expected to contain ${ rule.contains }, but it does not`)
        }

        if (rule.notContains && val && !(typeof val === 'string' && !val.includes(rule.notContains))) {
            throw new ValidationError(err || `Field ${ key } is expected not to contain ${ rule.notContains }, but it does`)
        }

        if (rule.isIn && val && !rule.isIn.includes(val)) {
            throw new ValidationError(err || `Field ${ key } does not match the permitted range of values`)
        }

        if (rule.notIn && val && rule.notIn.includes(val)) {
            throw new ValidationError(err || `Field ${ key } does not match the permitted range of values`)
        }

        if (rule.customValidation) {
            if (!rule.customValidation(val)) {
                throw new ValidationError(err || `Field ${ key } failed on custom validation`)
            }
        }
    }
    return true
}
