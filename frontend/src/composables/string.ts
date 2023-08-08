export function useSanitizeURL(input: string) {
    //TODO: Delete this and move to pinia store
    // format input to lower case and remove special characters
    input = input.toLowerCase().replace(/^a-zA-Z0-9 ]/g, '')
    return input
}
