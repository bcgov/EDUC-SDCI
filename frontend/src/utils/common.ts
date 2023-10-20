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
export function transformContactForDownload  (inputData: any): {} {
    return inputData.map((item: any) => ({
      districtNumber: item.districtNumber,
      mincode: item.mincode,
      displayName: item.displayName,
      addressLine1: item.addressLine1,
      city: item.city,
      provinceCode: item.provinceCode,
      postal: item.postal,
      jobTitle: item.jobTitle,
      firstName: item.firstName,
      lastName: item.lastName,
      facilityTypeCode: item.facilityTypeCode,
      schoolCategoryCode: item.schoolCategoryCode,
      phoneNumber: item.phoneNumber,
      phoneExtension: item.phoneExtension,
      alternatePhoneNumber: item.alternatePhoneNumber,
      alternatePhoneExtension: item.alternatePhoneExtension,
      email: item.email,
      grades: item.grades
    }))
}