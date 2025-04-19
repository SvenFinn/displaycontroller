import { useContext } from "react";
import { ActionsContext } from "./context";
import Button from "./button";
import { FaRegCopy } from "react-icons/fa6";

export default function Actions() {
    const context = useContext(ActionsContext);
    if (!context) {
        return <></>;
    }
    return (
        <>
            <Button onClick={() => alert("HI")}><FaRegCopy />Copy</Button>
        </>
    )
}