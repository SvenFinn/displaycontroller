export function mergeMaps<U, V>(map1: Map<U, V>, map2: Map<U, V>) {
    // map1 is the target map
    for (const [key, value] of map2.entries()) {
        map1.set(key, value);
    }
    for (const key of map1.keys()) {
        if (!map2.has(key)) {
            map1.delete(key);
        }
    }

}