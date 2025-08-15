import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { DbScreen } from "dc-screens-types";
import { getUiSchema as getEmbedLUiSchema, schema as embedSchema } from "@frontend/app/show/embed/components/EmbedEdit";
import { getUiSchema as getCpcViewUiSchema, schema as cpcViewSchema } from "@frontend/app/show/cpcView/components/CpcViewEdit";
import { getUiSchema as getDrawTargetUiSchema, schema as drawTargetSchema } from "@frontend/app/show/drawTarget/components/DrawTargetEdit";
import { getUiSchema as getEvaluationUiSchema, schema as evaluationSchema } from "@frontend/app/show/evaluation/components/EvaluationEdit";
import { getUiSchema as getImageViewerUiSchema, schema as imageViewerSchema } from "@frontend/app/show/imageViewer/components/ImageViewerEdit";

export function getUiSchema(data: DbScreen): UiSchema {
    switch (data.type) {
        case "cpcView":
            return getCpcViewUiSchema(data.options);
        case "drawTarget":
            return getDrawTargetUiSchema(data.options);
        case "evaluation":
            return getEvaluationUiSchema(data.options);
        case "imageViewer":
            return getImageViewerUiSchema(data.options);
        case "embed":
            return getEmbedLUiSchema(data.options);
        default:
            console.warn(`No UI schema defined for screen type: ${data.type}`);
            return {};
    }
}

export function getSchema(data: DbScreen): RJSFSchema {
    switch (data.type) {
        case "cpcView":
            return cpcViewSchema;
        case "drawTarget":
            return drawTargetSchema;
        case "evaluation":
            return evaluationSchema;
        case "imageViewer":
            return imageViewerSchema;
        case "embed":
            return embedSchema;
        default:
            console.warn(`No schema defined for screen type: ${data.type}`);
            return { type: "object", properties: {} };
    }
}
