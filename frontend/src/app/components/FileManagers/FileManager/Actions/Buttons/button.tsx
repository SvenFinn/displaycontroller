import styles from "./Actions.module.css";

type ButtonProps = {
    children: React.ReactNode;
    onClick: () => void;
};

export default function Button({ children, onClick }: ButtonProps) {
    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation(); // Prevents the click from bubbling up to parent elements
        event.preventDefault(); // Prevents the default button behavior
        onClick();
    }

    return (
        <button className={styles.button} onClick={handleClick}>
            {children}
        </button>
    );
}