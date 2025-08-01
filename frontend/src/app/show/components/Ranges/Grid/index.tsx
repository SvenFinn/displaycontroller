import styles from "./grid.module.css";

interface GridProps {
    rows: number;
    columns: number;
    children: React.ReactNode;
    className?: string;
}


export default function Grid({ rows, columns, children, className }: GridProps): React.JSX.Element {
    return (
        <div style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            fontSize: `${100 / rows}%`
        }} className={`${styles.grid} ${className || ""}`}>
            {children}
        </div>
    );

}