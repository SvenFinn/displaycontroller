import { isStartList, StartList } from "dc-ranges/types";
import styles from "./header.module.css";
import { HeightAsFontSize } from "@frontend/app/components/base/BoundingBoxCss";
import { memo, useEffect, useMemo, useState } from "react";
import { compareJSON } from "../Draw";
import { useHost } from "@frontend/app/hooks/useHost";

interface HeaderProps {
    startLists: Array<StartList>;
}

export const Header = memo(function HeaderMemoized({ startLists }: HeaderProps): React.JSX.Element {
    const [defaultNames, setDefaultNames] = useState<string[]>([]);
    const host = useHost();

    useEffect(() => {
        if (!host) {
            return;
        }
        if (startLists.length > 0) {
            return;
        }

        async function fetchDefaultNames() {
            try {
                const response = await fetch(`${host}/api/ranges/start-lists`);
                if (!response.ok) {
                    throw new Error("Could not fetch default start lists");
                }
                const data: any = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format for default start lists");
                }
                for (const item of data) {
                    if (!isStartList(item)) {
                        throw new Error("Invalid start list item");
                    }
                }
                const activeStartLists = data.filter((sl: StartList) => sl.active);
                setDefaultNames(activeStartLists.map((sl: StartList) => sl.name));
            } catch (error) {
                console.error("Error fetching default start lists:", error);
            }
        }

        fetchDefaultNames();
    }, [startLists.length, host]);

    const headerText = useMemo(() => {
        if (startLists.length === 0) {
            return defaultNames.join(", ");
        }

        const startListNames = startLists.map(sl => sl.name);
        const uniqueStartListNames = [...new Set(startListNames)];

        return uniqueStartListNames
            .sort((a, b) => {
                const aCount = startListNames.filter(n => n === a).length;
                const bCount = startListNames.filter(n => n === b).length;
                return bCount - aCount;
            })
            .join(", ");
    }, [startLists, defaultNames]);

    return (
        <HeightAsFontSize className={styles.header}>
            {headerText}
        </HeightAsFontSize>
    );
}, compareJSON);


export default Header;