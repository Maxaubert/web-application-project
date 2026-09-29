"use client";
import { useState } from "react"

export default function Email({onValueChange = null, text = "e-post addresse"}) {
    const [value, setValue] = useState("")
    function valueChange(newVal){
        if (onValueChange) {
            onValueChange(newVal.target.value)
        }
        setValue(newVal.target.value)
        
    }
    return (
        <input type="email" placeholder={text} onChange={valueChange } value = {value}></input>
    )
}