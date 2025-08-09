import dynamic from "next/dynamic";

const CpcView = dynamic(() => import("./customURL"), {
    ssr: false,
});

export default CpcView;