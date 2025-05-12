import { Screens } from ".";
import { EvaluationDbScreen } from "@shared/screens/evaluation";
import { isDirectoryListing } from "@shared/files";

export default async function evaluation(screen: EvaluationDbScreen): Promise<Screens> {
    const fileExists = (await fetch(`http://evaluations/api/evaluations/${screen.options.file}`)).ok;
    if (!fileExists) return []
    if (isDirectoryListing(fileExists)) return [];
    return [
        {
            available: true,
            id: screen.id,
            subId: 0,
            preset: "evaluation",
            options: screen.options,
            duration: screen.duration
        }
    ];
}


