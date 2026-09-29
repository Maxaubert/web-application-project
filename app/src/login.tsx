"use client";
import { useState } from "react";
import Email from "./email";
import PasswordField from "./password";

export default function Login({ onSubmit, onEmailChange}) {
    const [emailText, setEmailText ] = useState("")
    const [errorMessage, setErrorMessage]    = useState("")
    const regexp = /.+@.+\..+/
    function emailChange(value) {
        //onEmailChange(newVal)
        setEmailText(value)
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