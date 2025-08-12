import { EmbedOptions } from "dc-screens-types";
import styles from "./embed.module.css"

interface EmbedProps {
    options: EmbedOptions;
    onReady: () => void;
}

export default function Embed({ options, onReady }: EmbedProps) {

    return (
        <div className={styles.customURL}>
            <iframe
                src={options.url}
                title="Embed Viewer"
                className={styles.customURL}
                onLoad={onReady}
            />
        </div>
    )
}

