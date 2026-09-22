"use client";
import { useState } from "react";
import Email from "./email";
import PasswordField from "./password";

export default function Login({ onSubmit, onForgotPassword, onSignup, onEmailChange, onPasswordChange }) {
    const [email, setEmail ] = useState("")
    const [Password, setPassword] = useState("")

    function emailChange(newVal) {
        onEmailChange(newVal)
        setEmail(newVal)
    }
    function passwordChange(newVal) {
        onPasswordChange(newVal)
        setPassword(newVal)
    }    
    return (
        <div>
            <h2>logg inn</h2>
            <Email onValueChange = {emailChange}></Email>
            <PasswordField onValueChange = {passwordChange}></PasswordField>
            <button onClick = {onForgotPassword}>Glemt passord?</button>
            <button onClick = {onSignup}>Har du ikke konto? Klikk her</button>
            <button onClick={onSubmit}>Logg inn</button>
        </div>
    )
}