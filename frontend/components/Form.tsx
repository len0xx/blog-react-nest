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
    onComplete?: (state: SubmitState, response?: Record<string, unknown>, error?: string) => void | Promise<void>
    onSuccess?: (response?: Record<string, unknown>) => void | Promise<void>
    onError?: (error?: string) => void | Promise<void>
}

export enum SubmitState {
    Awaiting = 0,
    Success = 1,
    Error = 2
}

export interface FormRef {
    requestSubmit: () => void
}

export default forwardRef<FormRef, Props>(
    (
        {
            children,
            path,
            details,
            successMessage,
            errorMessage,
            validation,
            method = 'GET',
            displayAlert = false,
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
            setError(errorMessage)
            if (onLoadingUpdate) await onLoadingUpdate(true)
            const options: APIOptions<Record<string, unknown>> = details ? { method, ...details } : { method }

            try {
                if (validation && details && details.payload) validateSchema(validation, details.payload)
                response = await callAPI(path, options)
                localState = SubmitState.Success
                if (onSuccess) onSuccess(response)
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
            <form onSubmit={ handleSubmit } ref={ form }>
                { children }
                { displayAlert && state !== SubmitState.Awaiting && <>
                    <InlineAlert marginTop={ 16 } intent={ state === SubmitState.Success ? 'success' : 'danger' }>
                        { state === SubmitState.Success ? successMessage : ( error || errorMessage ) }
                    </InlineAlert>
                </> }
            </form>
        )
    }
)
