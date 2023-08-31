export function useSanitizeURL(input: string | String): String {
    // format input to lower case and remove special characters
    input = input.toLowerCase().replace(/^a-zA-Z0-9 ]/g, '')
    return input
}

export function formatPostalCode(input: string | String): String {
    return input?.replace(/(?<=^.{3})/, ' ');
}

export function formatPhoneNumber(input: string | String): String {
    return input?.replace(/(\d{3})(\d{3})(\d{4})/, `$1 $2-$3`);
}
