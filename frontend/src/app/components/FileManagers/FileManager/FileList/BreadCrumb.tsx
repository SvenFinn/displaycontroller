import { FaChevronRight, FaHome } from "react-icons/fa";
import styles from "./FileList.module.css";

type BreadCrumbProps = {
    currentPath: string;
    onPathChange(path: string): void;
}

export default function BreadCrumb({ currentPath, onPathChange }: BreadCrumbProps) {
    const pathParts = currentPath.split("/").filter(part => part !== "");
    pathParts.unshift(""); // Add an empty string to represent the root directory
    return (
        <div className={styles.breadCrumb}>
            {pathParts.map((part, index) => (
                <span className={styles.barFolder} key={index} onClick={() => onPathChange(pathParts.slice(0, index + 1).filter(part => part !== "").join("/"))}>
                    {part === "" ? <FaHome /> : (index > 0 ? <FaChevronRight /> : "")}
                    {part === "" ? "Home" : part}
                </span>
            ))}
        </div>
    );
}