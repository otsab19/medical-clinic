export const textFromCamelCase: (s: string) => string = (s: string) => {
    const toCamel = s.replace(/([a-z])([A-Z])/g, '$1 $2');
    return toCamel[0].toUpperCase() + toCamel.slice(1);
};
