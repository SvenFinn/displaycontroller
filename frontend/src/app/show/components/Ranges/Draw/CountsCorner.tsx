import styles from './rangeDraw.module.css';

export default function CountsCorner({ size }: { size: [number, number] }): React.JSX.Element {
    const points = [
        [size[0] * 1.5, -size[1] * 1.5],
        [size[0] * 1.5, size[1] * 0.75],
        [-size[0] * 0.75, - size[1] * 1.5]]
        .map(point => point.map(coord => Math.ceil(coord)));

    return (
        <polygon points={points.map(point => point.join(", ")).join(" ")} className={styles.countsCorner} />
    )
}