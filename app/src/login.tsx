"use client";
import { useState } from "react";
import Email from "./email";
import PasswordField from "./password";

export default function Login({ onSubmit, onEmailChange}) {
    const [emailText, setEmailText ] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [hidden, setHidden] = useState(false)
    const { code, setCode} = useState("")
    const regexp = /.+@.+\..+/
    function validEmail(email) {
        if (email.match(regexp)){
            return (true)
        }
        else {
            return(false)
        }
    }
    function emailChange(value) {
        //onEmailChange(newVal)
        setEmailText(value)
        if ( validEmail(value)  || !value) {
            setErrorMessage("")
        }
        else {
            setErrorMessage("Invalid email")
        }
        
    }
    function onButtonClicked(event) {
        if (!validEmail(emailText)){
            return
        }
        setHidden(true)
    }
    function onCodeChange(event) {
        setCode(event.target.value)
    }
    return (
        <>
        <div hidden={ hidden}>
            <h2>logg inn</h2>
            <Email onValueChange = {emailChange}></Email>
            <button onClick={onButtonClicked}>Logg inn</button>
            <p>{errorMessage}</p>
        </div>
        <div hidden={!hidden}>
                <p>En kode har blit sent til { emailText}. Skriv den inn i feltet under.</p>
                <input value={ code} onChange = {onCodeChange}></input>
            </div>
        </>
    )
}