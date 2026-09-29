"use client";
import { useState } from "react";
import Email from "./email";

type LoginProps = {
    onSubmit?: () => void
    onEmailChange?: (value: string) => void
}

export default function Login({ onSubmit, onEmailChange}: LoginProps) {
    const [errorMessage, setErrorMessage]    = useState("")
    const regexp = /.+@.+\..+/
    function emailChange(value: string) {
        onEmailChange?.(value)
        if (value.match(regexp) || !value) {
            setErrorMessage("")
        }
        else {
            setErrorMessage("Invalid email")
        }

    }
    return (
        <div>
            <h2>logg inn</h2>
            <Email onValueChange = {emailChange}></Email>
            <button onClick={onSubmit}>Logg inn</button>
            <p>{errorMessage}</p>
        </div>
    )
}