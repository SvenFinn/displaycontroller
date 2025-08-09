import dynamic from "next/dynamic";

const CpcView = dynamic(() => import("./cpcView"), {
    ssr: false,
});

export default CpcView; 