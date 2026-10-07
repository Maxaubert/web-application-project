"use client";

import { useState } from "react";

type PostProps = { title: string; text: string; by: string; id: string };

export default function Post({ title, text }: PostProps) {
    const [borrowed, setBorrowed] = useState(false); //todo, get default value from database
    function borrow() {
        // todo, fetch value from database, update value, and write it back.
        setBorrowed(!borrowed);
    }
    return (
        <>
            <h2>{title}</h2>
            <p>{text}</p>
            <button type="button" onClick={borrow}>Lån {title}</button>
        </>
    );
}
