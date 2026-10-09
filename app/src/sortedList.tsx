"use client";
// Uferdig arbeid (Emil 08.10). Ubrukte variabler og any er tillatt i denne fila til den er ferdig.
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { useState } from "react";

interface listProps {
    listItems: string[];
    headders: string[];
    sortFunction: any; //Don't know how I define function types
}
export default function SortedList({ listItems, headders }: listProps) {
    const [sort, setSort] = useState(0);
    const [items, setItems] = useState([...listItems]) // Use a new list, so we don't modify the original one at any point.
    function comboBoxMapCallBack(element: string, index: number, list: string[]) {
        return (<option value={index}>{ element}</option>)
    }
    function listMapCallBack(element: string, index: number, list: string[]) {
        return (<li>{element}</li>)
    }
    function onComboBoxChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setSort(Number(event.target.value));
    }

    return (
        <div>
        <p>sorter etter:</p>
        <select onChange = {onComboBoxChange} value = {sort}>{headders.map(comboBoxMapCallBack)}</select>
        </div>
    )
}