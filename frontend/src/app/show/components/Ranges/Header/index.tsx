import { Range } from "dc-ranges-types";
import styles from "./header.module.css"


interface HeaderProps {
    ranges: Array<Range | null>;
}

export default function Header({ ranges }: HeaderProps): React.JSX.Element {
    const startLists = ranges.map((range) => {
        if (range === null) return null;
        if (range.active === false) return null;
        if (range.startList === null) return null;
        return range.startList.name;
    });
    const startListNames = startLists.filter((startList) => startList !== null);
    const uniqueStartListNames = [...new Set(startListNames)];
    // Get the start list with the most active ranges
    const startList = uniqueStartListNames.sort((a, b) => {
        const aCount = startLists.filter((startList) => startList === a).length;
        const bCount = startLists.filter((startList) => startList === b).length;
        return bCount - aCount;
    })[0];
    return (
        <div className={styles.header}>
            {startList}
        </div>
    )
}