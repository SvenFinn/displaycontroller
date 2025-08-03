import circleSVG from "./circle.svg";
import dividerSVG from "./divider.svg";
import dividerTenth from "./divider-tenth.svg";
import dividerHundredth from "./divider-hundredth.svg";
import fullHiddenSVG from "./fullHidden.svg";
import hiddenSVG from "./hidden.svg";
import ringsDivSVG from "./ringsDiv.svg";
import ringsDivTenthSVG from "./ringsDiv-tenth.svg";
import ringsSVG from "./rings.svg";
import ringsTenthSVG from "./rings-tenth.svg";
import dartSVG from "./dart.svg";
import hundredSVG from "./hundred.svg";
import decimalSVG from "./decimal.svg";
import { useAppSelector } from "../../../ranges-store/store";

export default function ModeIcon({ id, className }: { id: number, className?: string }): React.JSX.Element {
    const mode = useAppSelector((state) => {
        const range = state.ranges[id];
        if (!range || !range.active) {
            return null;
        }
        return range.discipline?.rounds[range.round]?.mode;
    });
    if (!mode) {
        return <></>;
    }
    switch (mode.mode) {
        case "rings":
            if (mode.decimals === 0) {
                return <img src={ringsSVG.src} alt="Rings" className={className} />;
            }
            return <img src={ringsTenthSVG.src} alt="Rings Tenth" className={className} />;
        case "divider":
            if (mode.decimals === 0) {
                return <img src={dividerSVG.src} alt="Divider" className={className} />;
            } else if (mode.decimals === 1) {
                return <img src={dividerTenth.src} alt="Divider Tenth" className={className} />;
            }
            return <img src={dividerHundredth.src} alt="Divider Hundredth" className={className} />;
        case "ringsDiv":
            if (mode.decimals === 0) {
                return <img src={ringsDivSVG.src} alt="Rings Divider" className={className} />;
            }
            return <img src={ringsDivTenthSVG.src} alt="Rings Divider Tenth" className={className} />;
        case "circle":
            return <img src={circleSVG.src} alt="Circle" className={className} />;
        case "fullHidden":
            return <img src={fullHiddenSVG.src} alt="Full Hidden" className={className} />;
        case "hidden":
            return <img src={hiddenSVG.src} alt="Hidden" className={className} />;
        case "hundred":
            return <img src={hundredSVG.src} alt="Hundred" className={className} />;
        case "decimal":
            return <img src={decimalSVG.src} alt="Decimal" className={className} />;
        case "target":
            if (mode.exact && mode.value === 501) {
                return <img src={dartSVG.src} alt="Target 501" className={className} />;
            }
        default:
            return <></>;
    }
}