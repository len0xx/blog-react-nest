'use client'

import { APIOptions, ValidationSchema, callAPI, validateSchema } from "@/util"
import { InlineAlert } from "evergreen-ui"
import { HTTP_METHOD } from "next/dist/server/web/http"
import { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react"

export type FormDetails = Omit<APIOptions<Record<string, unknown>>, 'method'>
export type SubmitFn = (path?: string | URL, method?: HTTP_METHOD, details?: FormDetails) => void | Promise<void>
export type CompleteFn = (state?: SubmitState, response?: Record<string, unknown>, error?: string) => void | Promise<void>
export type LoadingUpdateFn = (state: boolean) => void | Promise<void>
export type SuccessFn = (response?: Record<string, unknown>) => void | Promise<void>
export type ErrorFn = (error?: string) => void | Promise<void>

interface Props {
    children?: React.ReactNode
    method?: HTTP_METHOD
    action?: string | URL
    displayMsg?: boolean
    details?: FormDetails
    successMessage?: React.ReactNode
    errorMessage?: React.ReactNode
    validation?: ValidationSchema
    className?: string
    onSubmit?: SubmitFn
    onLoadingUpdate?: LoadingUpdateFn
    onComplete?: CompleteFn
    onSuccess?: SuccessFn
    onError?: ErrorFn
}

export enum SubmitState {
    Awaiting = 0,
    Success = 1,
    Error = 2
}

export interface FormRef {
    requestSubmit: () => void
}

export class FormError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export default forwardRef<FormRef, Props>(
    (
        {
            children,
            action,
            details,
            successMessage,
            errorMessage,
            validation,
            className,
            method = 'GET',
            displayMsg = false,
            onSubmit,
            onLoadingUpdate,
            onComplete,
            onSuccess,
            onError
        }: Props,
        ref: Ref<FormRef>
    ) => {
        const form = useRef<HTMLFormElement>(null)
        const [ state, setState ] = useState(SubmitState.Awaiting)
        const [ error, setError ] = useState(errorMessage)

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            let response: Record<string, unknown> | undefined
            let localState = SubmitState.Awaiting
            let localError: string | undefined
            setState(localState)
            setError(errorMessage)
            if (onLoadingUpdate) await onLoadingUpdate(true)
            const options: APIOptions<Record<string, unknown>> = details ? { method, ...details } : { method }

            try {
                if (validation && details && details.payload) validateSchema(validation, details.payload)
                if (onSubmit) {
                    await onSubmit(action, method, details)
                }
                else {
                    if (!action) throw new FormError('"action" is not specified')
                    response = await callAPI(action, options)
                }
                localState = SubmitState.Success
                if (onSuccess) onSuccess(response)
            }
            catch (e) {
                console.error(e)
                if (e instanceof Error) {
                    if (e instanceof FormError) throw e
                    localError = e.message
                    setError(localError)
                }
                localState = SubmitState.Error
                if (onError) onError(localError)
            }
            finally {
                setState(localState)
                if (onLoadingUpdate) await onLoadingUpdate(false)
                if (onComplete) await onComplete(localState, response, localError)
            }
        }

        const publicRef = {
            requestSubmit: () => form.current ? form.current.requestSubmit() : null
        }

        useImperativeHandle(ref, () => publicRef)

        return (
            <form onSubmit={ handleSubmit } ref={ form } className={ className }>
                { children }
                { displayMsg && state !== SubmitState.Awaiting && <>
                    <InlineAlert marginTop={ 16 } intent={ state === SubmitState.Success ? 'success' : 'danger' }>
                        { state === SubmitState.Success ? successMessage : ( error || errorMessage ) }
                    </InlineAlert>
                </> }
            </form>
        )
    }
)
