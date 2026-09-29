"use client";
import { useState } from "react";
import Email from "./email";
import PasswordField from "./password";

export default function Login({ onSubmit, onEmailChange}) {
    const [emailText, setEmailText ] = useState("")
    const [errorMessage, setErrorMessage]    = useState("")

    function emailChange(value) {
        //onEmailChange(newVal)
        setEmailText(value)
        setErrorMessage(value)
    }
    return (
        <div>
            <h2>logg inn</h2>
            <Email onValueChange = {emailChange}></Email>
            <button onClick={onSubmit}>Logg inn</button>
            <input type="email" value={errorMessage}></input>
        </div>
    )
}