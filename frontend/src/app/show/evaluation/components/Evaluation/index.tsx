import dynamic from "next/dynamic";

const Evaluation = dynamic(() => import("./evaluation"), {
    ssr: false,
});

export default Evaluation;