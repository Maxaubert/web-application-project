"use client";
import { useState, type ChangeEvent } from "react"

type PasswordFieldProps = {
    onValueChange?: (value: string) => void
    text?: string
}

export default function PasswordField({ onValueChange, text = "password"}: PasswordFieldProps) {
    const [value, setValue] = useState("")
    function valueChange(newVal: ChangeEvent<HTMLInputElement>) {
        if (onValueChange) {
            onValueChange(newVal.target.value)
        }
        setValue(newVal.target.value)
    }

    return (
        <input type = "password" placeholder = {text} onChange = {valueChange} value = {value}></input>
    )
}