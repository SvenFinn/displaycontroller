import { useAppSelector } from "../ranges-store/store";
import HeaderComponent from "../../../../components/Ranges/Header";

export default function Header(): React.JSX.Element {
    const ranges = useAppSelector((state) => state.ranges);
    return (
        <HeaderComponent ranges={ranges} />
    );
}