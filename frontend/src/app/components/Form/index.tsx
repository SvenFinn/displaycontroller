import dynamic from "next/dynamic";
import { FormDefinition } from "./formWrapper";

const FormWrapper = dynamic(() => import("./formWrapper"), {
    ssr: false, // ensures it only renders on client
});

const FormWrapperDyn = FormWrapper as typeof FormWrapper & {
    <T>(props: FormDefinition<T>): React.JSX.Element;
};

export default FormWrapperDyn;
