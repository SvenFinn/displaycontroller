import Header from "@frontend/app/show/components/Ranges/Header";
import { useAppSelector } from "./ranges-store/store";
import { StartList } from "dc-ranges/types";

export function CpcHeader() {
    const startLists = useAppSelector((state) => {
        const ranges = Object.values(state.ranges);
        let startLists: StartList[] = [];
        for (const range of ranges) {
            if (range.active && range.startList) {
                startLists.push(range.startList);
            }
        }
        return startLists;
    });
    return (
        <Header startLists={startLists} />
    )
}