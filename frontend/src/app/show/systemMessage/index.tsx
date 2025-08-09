import dynamic from "next/dynamic";

const SystemMessage = dynamic(() => import("./systemMessage"), {
    ssr: false,
});

export default SystemMessage;