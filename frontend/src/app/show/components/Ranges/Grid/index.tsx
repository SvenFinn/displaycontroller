import { BoundingBoxCss, HeightAsFontSize } from "@frontend/app/components/base/BoundingBoxCss";
import styles from "./grid.module.css";

interface GridProps {
    rows: number;
    columns: number;
    children: React.ReactNode;
    className?: string;
}


export default function Grid({ rows, columns, children, className }: GridProps): React.JSX.Element {
    return (
        <BoundingBoxCss className={className} >
            <div style={{
                "--rows": rows,
                "--columns": columns,
            } as React.CSSProperties
            } className={styles.grid}>
                {children}
            </div>
        </BoundingBoxCss>
    );

}