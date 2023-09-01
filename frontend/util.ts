import { HTTP_METHOD } from "next/dist/server/web/http"
import { API_ENDPOINT } from "./config"

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
    createdAt: Date
    saved?: boolean
}

export interface User {
    id: number
    firstName: string    
    lastName: string    
    fullName: string    
    email: string    
    about: string    
}

export type Author = User

export interface APIOptions<PayloadType = any> {
    method: HTTP_METHOD
    token?: string
    payload?: PayloadType
    headers?: Headers | [string, string][]
}

export const extractHeader = (
    headers: Headers | [string, string][] | undefined,
    name: string
): string | null => {
    if (!headers) return null

    if (headers instanceof Headers) {
        return headers.get(name)
    }

    const filtered = headers.filter((header) => header[0] === name)
    return filtered.length ? filtered[0][1] : null
}

export const callAPI = async <
    APIResponse = any,
    Payload = any
>(
    path: string | URL,
    { method, token, payload, headers }: APIOptions<Payload>
): Promise<APIResponse> => {
    let contentType = 'application/json'
    if (extractHeader(headers, 'Content-Type')) contentType = extractHeader(headers, 'Content-Type')!

    const finalHeaders: Record<string, string> = { 'Content-Type': contentType }
    if (token) finalHeaders['Authorization'] = token

    const options: RequestInit = {
        method,
        headers: finalHeaders,
        body: (contentType === 'application/json' ? JSON.stringify(payload) : payload) as BodyInit
    }

    const finalUrl = path instanceof URL ? path.toString() : `${ API_ENDPOINT }${ path }`
    const res = await fetch(finalUrl, options)
    if (!res.ok) {
        let errorText = res.statusText

        try {
            const response = await res.json()
            if (response.message) errorText = response.message
            else if (response.error) errorText = response.error
        }
        finally {
            throw new HTTPError(res.status, errorText)
        }
    }
    return await res.json()
}

export type AllowedTypes = 'string' | 'number' | 'array' | 'object' | 'boolean' | 'bigint' | 'undefined' | 'symbol'
export const allowedTypes: AllowedTypes[] = [ 'string', 'number', 'boolean', 'bigint', 'undefined', 'object' ]

export interface ValidationRule<ValueType = any> {
    type?: AllowedTypes
    required?: boolean
    isNumeric?: boolean
    minLen?: number
    maxLen?: number
    minValue?: ValueType
    maxValue?: ValueType
    match?: ValueType | (() => ValueType)
    dontMatch?: ValueType | (() => ValueType)
    matchRegex?: RegExp
    contains?: string | (string | number)[][]
    notContains?: string | (string | number)[][]
    isIn?: ValueType[]
    notIn?: ValueType[]
    customValidation?: (input: ValueType) => boolean
    errorText?: string
    alphaNum?: boolean
}

export type ValidationSchema<ValueType = any> = Record<string, ValidationRule<ValueType>>

export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export interface ObjectHasLength extends Object {
    length: number
}

export const includesAny = (input: string, arr: string[]) => {
    let flag = false
    for (const char of arr) {
        if (input.includes(char)) {
            flag = true
            break
        }
    }
    return flag
}

export const validateSchema = <ValueType>(
    schema: ValidationSchema,
    data: Record<string, ValueType>
): boolean => {
    for (const key in schema) {
        const rule = schema[key]
        const val = data[key]
        const err = rule.errorText

        if (rule.type) {
            if (allowedTypes.includes(rule.type)) {
                if (typeof val !== rule.type) {
                    throw new ValidationError(err || `Field ${ key } is expected to be of type '${ rule.type }', but its type is ${ typeof val }`)
                }
            }
            else if (rule.type === 'array' && !Array.isArray(val)) {
                throw new ValidationError(err || `Field ${ key } is expected to be of type 'array', but it is not an array`)
            }
        }

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

        if (rule.match) {
            if (typeof rule.match === 'function') {
                if (rule.match() !== val) {
                    throw new ValidationError(err || `Field ${ key } did not match ${ rule.match }`)
                }
            }
            else if (rule.match !== val) {
                throw new ValidationError(err || `Field ${ key } did not match ${ rule.match }`)
            }
        }

        if (rule.dontMatch) {
            if (typeof rule.dontMatch === 'function') {
                if (rule.dontMatch() === val) {
                    throw new ValidationError(err || `Field ${ key } should not match ${ rule.dontMatch }`)
                }
            }
            else if (rule.dontMatch === val) {
                throw new ValidationError(err || `Field ${ key } should not match ${ rule.dontMatch }`)
            }
        }

        if (rule.matchRegex && !rule.matchRegex.test(val as string)) {
            throw new ValidationError(err || `Field ${ key } is expected to match the certain Regular Expression, but it does not`)
        }

        if (rule.contains && val && (typeof val === 'string' || Array.isArray(val))) {
            if (typeof rule.contains === 'string') {
                if (!(typeof val === 'string' && val.includes(rule.contains))) {
                    throw new ValidationError(err || `Field ${ key } is expected to contain ${ rule.contains }, but it does not`)
                }
            }
            else {
                let failure: (string | number)[] = []
                let flag = true

                for (const collection of rule.contains) {
                    let localFlag = false
                    for (const item of collection) {
                        if (val.includes(item.toString())) {
                            localFlag = true
                            break
                        }
                    }

                    if (!localFlag) {
                        failure = collection
                        flag = false
                        break
                    }
                }

                if (!flag) {
                    throw new ValidationError(
                        err || `Field ${ key } is expected to contain at least one value from the list: ${ failure.join(', ') }, but it does not`
                    )
                }
            }
        }

        if (rule.notContains && val && (typeof val === 'string' || Array.isArray(val))) {
            if (typeof rule.notContains === 'string') {
                if (typeof val === 'string' && val.includes(rule.notContains)) {
                    throw new ValidationError(err || `Field ${ key } is expected not to contain ${ rule.notContains }, but it does`)
                }
            }
            else {
                let failure: (string | number)[] = []
                let flag = true

                for (const collection of rule.notContains) {
                    let localFlag = false
                    for (const item of collection) {
                        if (!val.includes(item.toString())) {
                            localFlag = true
                            break
                        }
                    }

                    if (localFlag) {
                        failure = collection
                        flag = false
                        break
                    }
                }

                if (!flag) {
                    throw new ValidationError(
                        err || `Field ${ key } is expected not to contain any value from the list: ${ failure.join(', ') }, but it does`
                    )
                }
            }
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

        if (rule.alphaNum && val && typeof val === 'string') {
            if (!/^[a-zA-Z0-9]*$/.test(val)) {
                throw new ValidationError(err || `Field ${ key } is expected to only contain alpha-numeric characters`)
            }
        }
    }
    return true
}
