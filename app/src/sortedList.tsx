"use client";
import { useState } from "react";
import { arrayOutputType } from "zod/v3";

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
    function onComboBoxChange(event) {
        setSort(event.target.value);
    }

    return (
        <div>
        <p>sorter etter:</p>
        <select onChange = {onComboBoxChange} value = {sort}>{headders.map(comboBoxMapCallBack)}</select>
        </div>
    )
}