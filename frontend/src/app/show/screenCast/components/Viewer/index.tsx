import dynamic from "next/dynamic";

const ScreenCastViewer = dynamic(() => import("./screenCastViewer"), {
    ssr: false,
});

export default ScreenCastViewer;