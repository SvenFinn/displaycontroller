import dynamic from "next/dynamic";

const Embed = dynamic(() => import("./embed"), {
    ssr: false,
});

export default Embed;