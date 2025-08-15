import { DbScreen } from "dc-screens-types";
import Select from "react-select";
import styles from "./screenList.module.css";
import { FaPlus } from "react-icons/fa6";
import { useAppDispatch } from "../../store/store";
import { useState } from "react";
import { createScreen } from "../../store/screensReducer";

export default function NewScreen() {
    const dispatch = useAppDispatch();
    const [type, setType] = useState<DbScreen["type"]>("cpcView");
    const types: Record<Exclude<DbScreen["type"], "systemMessage" | "screenCast">, string> = {
        cpcView: "CPC View",
        drawTarget: "Draw Target",
        embed: "Embed Web Page",
        imageViewer: "Image Viewer",
        evaluation: "Evaluation",
    };

    const options = Object.keys(types).map((key) => ({
        value: key,
        label: types[key as keyof typeof types],
    }));

    return (
        <div className={`${styles.screenListEntry} ${styles.addEntry}`} key="addScreen">
            <Select options={options} defaultValue={options[0]} value={options.find((option) => option.value == type)} onChange={(option) => setType((option?.value || "cpcView") as keyof typeof types)} />
            <FaPlus className={styles.addIcon} onClick={() => { dispatch(createScreen(type)) }} />
        </div>);
}