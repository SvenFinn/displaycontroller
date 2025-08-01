import styles from './rangeDraw.module.css';

export default function CountsCorner({ counts, size }: { counts: boolean, size: [number, number] }): React.JSX.Element {
    if (counts) {
        return <></>
    }
    const points = [[size[0] / 2, -size[1] / 2], [size[0] / 2, -size[1] / 2 + size[1] / 4], [size[0] / 2 - size[0] / 4, -size[1] / 2]]
    return (
        <polygon points={points.map(point => point.join(", ")).join(" ")} className={styles.countsCorner} />
    )
}