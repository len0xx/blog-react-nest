'use client'

import { ValidationError, ValidationSchema, callAPI, validateSchema } from "@/util"
import { InlineAlert } from "evergreen-ui"
import { HTTP_METHOD } from "next/dist/server/web/http"
import { useState } from "react"

interface Props {
    children?: React.ReactNode
    method?: HTTP_METHOD
    path: string
    displayAlert?: boolean
    token?: string
    payload?: any
    headers?: Headers | [string, string][]
    successMessage?: React.ReactNode
    errorMessage?: React.ReactNode
    validation?: ValidationSchema
    onSubmit?: (state: SubmitState, response?: Record<string, unknown>) => Promise<void>
}

export enum SubmitState {
    Unknown = 0,
    Success = 1,
    Error = 2
}

export default ({
    children,
    method = 'GET',
    path,
    displayAlert = false,
    token,
    payload,
    headers,
    successMessage,
    errorMessage,
    validation,
    onSubmit
}: Props) => {
    const [ state, setState ] = useState(SubmitState.Unknown)
    const [ error, setError ] = useState(errorMessage)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        let response: Record<string, unknown> | undefined
        let localState = SubmitState.Unknown
        setError(errorMessage)

        try {
            if (validation) validateSchema(validation, payload)
            response = await callAPI(path, { method, headers, payload, token })
            localState = SubmitState.Success
        }
        catch (e) {
            if (e instanceof ValidationError) {
                setError(e.message)
            }
            console.error(e)
            localState = SubmitState.Error
        }
        finally {
            setState(localState)
            if (onSubmit) await onSubmit(localState, response)
        }
    }

    return (
        <form onSubmit={ handleSubmit }>
            { children }
            { displayAlert && state !== SubmitState.Unknown && <>
                <InlineAlert marginTop={ 16 } intent={ state === SubmitState.Success ? 'success' : 'danger' }>
                    { state === SubmitState.Success ? successMessage : ( error || errorMessage ) }
                </InlineAlert>
            </> }
        </form>
    )
}
