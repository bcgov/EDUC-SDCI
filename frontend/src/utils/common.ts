/** FORMAT FUNCTIONS */
export function distNumberFromMincode(input: string | String) {
  return input.slice(0, 3)
}
export function formatPostalCode(input: string | String): String {
  return input?.replace(/(?<=^.{3})/, ' ')
}

export function formatPhoneNumber(input: string | String): String {
  return input?.replace(/(\d{3})(\d{3})(\d{4})/, `$1 $2-$3`)
}
export function useSanitizeURL(input: string | String): String {
  // format input to lower case and remove special characters
  input = input.toLowerCase().replace(/^a-zA-Z0-9 ]/g, '')
  return input
}

/** VALIDATION FUNCTIONS */
export function isValidDistrictNumber(input: string | String | number): boolean {
  return !!input && input.toString().length === 3 && /^\d+$/.test(input.toString())
}

export function isActiveDateString(
  startDateString: string | null,
  endDateString: string | null
): boolean {
  if (!startDateString) {
    return false
  }
  let startDate: Date = new Date(startDateString)
  let currentDate: Date = new Date()

  if (!!endDateString) {
    let endDate: Date = new Date(endDateString)
    return startDate <= currentDate && endDate > currentDate
  } else {
    return startDate <= currentDate
  }
}
