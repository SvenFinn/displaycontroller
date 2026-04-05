import { isStartList, StartList } from "dc-ranges/types";
import styles from "./header.module.css";
import { HeightAsFontSize } from "@frontend/app/components/base/BoundingBoxCss";
import { memo, useEffect, useMemo, useState } from "react";
import { compareJSON } from "../Draw";
import { useHost } from "@frontend/app/hooks/useHost";
import { request } from "dc-endpoints";
import { getAllStartLists } from "dc-ranges/endpoints";

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
            const startLists = await request(host, getAllStartLists);
            if (startLists.type === "error" || !startLists.body) {
                console.error("Failed to fetch default start lists");
                setDefaultNames([]);
                return;
            }
            const activeStartLists = startLists.body.filter((sl: StartList) => sl.active);
            setDefaultNames(activeStartLists.map((sl: StartList) => sl.name));
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