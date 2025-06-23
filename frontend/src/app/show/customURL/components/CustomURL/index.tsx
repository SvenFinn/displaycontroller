import { CustomURLOptions } from "@shared/screens/customURL";
import styles from "./customURL.module.css"

interface ImageViewerProps {
    options: CustomURLOptions;
    onReady: () => void;
}

export default function CustomURL({ options, onReady }: ImageViewerProps) {

    return (
        <div className={styles.customURL}>
            <iframe
                src={options.url}
                title="Custom URL Viewer"
                className={styles.customURL}
                onLoad={onReady}
            />
        </div>
    )
}

