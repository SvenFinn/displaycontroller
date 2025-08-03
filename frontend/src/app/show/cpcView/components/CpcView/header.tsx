import Header from "@frontend/app/show/components/Ranges/Header";
import { useAppSelector } from "./ranges-store/store";

export function CpcHeader() {
    const ranges = useAppSelector((state) => state.ranges);
    return (
        <Header ranges={ranges} />
    )
}