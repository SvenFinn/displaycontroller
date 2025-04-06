
type TopBarProps = {
    currentPath: string;
    onPathChange(path: string): void;
}

export default function TopBar({ currentPath, onPathChange }: TopBarProps) {
    const pathParts = currentPath.split("/").filter(part => part !== "");
    pathParts.unshift(""); // Add an empty string to represent the root directory
    return (
        <div className="top-bar">
            <div className="path">
                {pathParts.map((part, index) => (
                    <span key={index} onClick={() => onPathChange(pathParts.slice(0, index + 1).filter(part => part !== "").join("/"))}>
                        {part === "" ? "Home" : part}
                        {index < pathParts.length - 1 ? " / " : ""}
                    </span>
                ))}
            </div>
        </div>
    );
}