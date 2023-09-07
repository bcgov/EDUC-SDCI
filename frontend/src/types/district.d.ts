interface Address {
  addressLine1: string,
  addressLine2: string,
  addressTypeCode: string,
  city: string,
  countryCode: string,
  createDate: string,
  createUser: string,
  districtAddressId: string,
  districtId: string,
  postal: string,
  provinceCode: string,
  updateDate: string,
  updateUser: string,
}

interface Contact {
  createUser: string,
  updateUser: string,
  createDate: string,
  updateDate: string,
  districtContactId: string,
  districtId: string,
  districtContactTypeCode: string,
  phoneNumber: string,
  jobTitle: string,
  phoneExtension: string,
  alternatePhoneNumber: string,
  alternatePhoneExtension: string,
  email: string,
  firstName: string,
  lastName: string,
  effectiveDate: string,
  expiryDate: string,
}
interface District {
  districtData: {
    createDate: string,
    createUser: string,
    displayName: string,
    districtId: string,
    districtNumber: string,
    districtRegionCode: string,
    districtStatusCode: string,
    email: string,
    faxNumber: string,
    phoneNumber: string,
    updateDate: string,
    updateUser: string,
    website: string,
    notes: [],
    contacts: Contact[],
    addresses: Address[],
  },
  districtSchools: []
}

interface ListDistrict {
  displayName: string,
  districtNumber: string,
  districtId: string,
}
