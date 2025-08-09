import dynamic from "next/dynamic";

const ImageViewer = dynamic(() => import("./imageViewer"), {
    ssr: false,
});

export default ImageViewer;