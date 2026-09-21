import { useState } from "react"

export default function Email({onValueChange = null, text = "e-post addresse"}) {
    const [value, setValue] = useState("")
    function valueChange(newVal){
        if (onValueChange) {
            onValueChange(newVal)
        }
        setValue(newVal)
    }
    return (
        <input type="email" placeholder={text} onChange={ valueChange}></input>
    )
}