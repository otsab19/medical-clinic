export const textFromCamelCase: (s: string) => string = (s: string) => {
    return s.replace(/([a-z])([A-Z])/g, '$1 $2');
};
