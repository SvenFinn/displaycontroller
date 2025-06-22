import styles from "./Actions.module.css";

type ButtonProps = {
    children: React.ReactNode;
    onClick: () => void;
};

export default function Button({ children, onClick }: ButtonProps) {
    return (
        <button className={styles.button} onClick={onClick}>
            {children}
        </button>
    );
}