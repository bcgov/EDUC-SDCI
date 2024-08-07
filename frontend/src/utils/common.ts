export function distNumberFromMincode(input: string | String) {
    return input.slice(0, 3);
}
export function formatPostalCode(input: string | String): String {
    return input?.replace(/(?<=^.{3})/, ' ');
}

export function formatPhoneNumber(input: string | String): String {
    return input?.replace(/(\d{3})(\d{3})(\d{4})/, `$1 $2-$3`);
}
export function useSanitizeURL(input: string | String): String {
    // format input to lower case and remove special characters
    input = input.toLowerCase().replace(/^a-zA-Z0-9 ]/g, '')
    return input
}

/** VALIDATION FUNCTIONS */
export function isValidDistrictNumber(input: string | String | number): boolean {
    return !!input && input.toString().length === 3 && /^\d+$/.test(input.toString());
}
