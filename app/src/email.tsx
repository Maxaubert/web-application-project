"use client";
import { useState, type ChangeEvent } from "react"

type EmailProps = {
    onValueChange?: (value: string) => void
    text?: string
}

export default function Email({onValueChange, text = "e-post addresse"}: EmailProps) {
    const [value, setValue] = useState("")
    function valueChange(newVal: ChangeEvent<HTMLInputElement>){
        if (onValueChange) {
            onValueChange(newVal.target.value)
        }
        setValue(newVal.target.value)

    }
    return (
        <input type="email" placeholder={text} onChange={valueChange } value = {value}></input>
    )
}