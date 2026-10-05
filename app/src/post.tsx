"use client";

import { title } from "node:process";
import { useState } from "react";

export default function Post({ title: string, text: string, by: string, id: string }) {
const [borrowed, setBorrowed] = useState(false)//todo, get default value from database
    function like(post: string = id) {
        // todo, fetch value from database, update value, and write it back.
        setBorrowed(!borrowed);
    }
    return (
        <h2>{title}</h2>
        <p>{text}</p>
        <button onClick = {like}>liker ()</button>
    )
}