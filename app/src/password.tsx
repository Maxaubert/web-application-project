import { useState } from "react"

export default function PasswordField({ onValueChange = null, text = "password"}) {
    const [value, setValue] = useState(value)
    function valueChange(newVal) {
        if (onValueChange) {
            valueChange(newVal)
        }
        setValue(newVal)
    }
    
    return (
        <input type = "password" placeholder = {text} onChange = {valueChange}></input>
    )
}