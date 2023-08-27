'use client'

import { APIOptions, ValidationError, ValidationSchema, callAPI, validateSchema } from "@/util"
import { InlineAlert } from "evergreen-ui"
import { HTTP_METHOD } from "next/dist/server/web/http"
import { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react"

interface Props {
    children?: React.ReactNode
    method?: HTTP_METHOD
    path: string | URL
    displayAlert?: boolean
    details?: Omit<APIOptions<Record<string, unknown>>, 'method'>
    successMessage?: React.ReactNode
    errorMessage?: React.ReactNode
    validation?: ValidationSchema
    onLoadingUpdate?: (state: boolean) => void | Promise<void>
    onSubmit?: (state: SubmitState, response?: Record<string, unknown>, error?: string) => void | Promise<void>
}

export enum SubmitState {
    Unknown = 0,
    Success = 1,
    Error = 2
}

export interface FormRef {
    requestSubmit: () => void
}

export default forwardRef<FormRef, Props>(({
    children,
    path,
    details,
    successMessage,
    errorMessage,
    validation,
    method = 'GET',
    displayAlert = false,
    onLoadingUpdate,
    onSubmit
}: Props, ref: Ref<FormRef>) => {
    const form = useRef<HTMLFormElement>(null)
    const [ state, setState ] = useState(SubmitState.Unknown)
    const [ error, setError ] = useState(errorMessage)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        let response: Record<string, unknown> | undefined
        let localState = SubmitState.Unknown
        let localError: string | undefined
        setError(errorMessage)
        if (onLoadingUpdate) await onLoadingUpdate(true)

        try {
            if (validation && details && details.payload) validateSchema(validation, details.payload)
            const options: APIOptions<Record<string, unknown>> = details ? { method, ...details } : { method }
            response = await callAPI(path, options)
            localState = SubmitState.Success
        }
        catch (e) {
            console.error(e)
            if (e instanceof Error) {
                localError = e.message
                if (e instanceof ValidationError) {
                    setError(localError)
                }
            }
            localState = SubmitState.Error
        }
        finally {
            setState(localState)
            if (onSubmit) await onSubmit(localState, response, localError)
            if (onLoadingUpdate) await onLoadingUpdate(false)
        }
    }

    const publicRef = {
        requestSubmit: () => form.current ? form.current.requestSubmit() : null
    }

    useImperativeHandle(ref, () => publicRef)

    return (
        <form onSubmit={ handleSubmit } ref={ form }>
            { children }
            { displayAlert && state !== SubmitState.Unknown && <>
                <InlineAlert marginTop={ 16 } intent={ state === SubmitState.Success ? 'success' : 'danger' }>
                    { state === SubmitState.Success ? successMessage : ( error || errorMessage ) }
                </InlineAlert>
            </> }
        </form>
    )
})
