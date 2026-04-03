import { useAppSelector } from "../ranges-store/store";
import HeaderComponent from "../../../../components/Ranges/Header";
import { ActiveRange, StartList } from "dc-ranges/types";

export default function Header(): React.JSX.Element {
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
        <HeaderComponent startLists={startLists} />
    );
}