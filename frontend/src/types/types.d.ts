// COMMON - base interfaces for types that share common properties
interface Code {
  label: string;
  description: string;
  displayOrder: number | string;
  effectiveDate: string;
  expiryDate: string;
  legacyCode?: string;
}

interface Contact {
  createUser?: string;
  updateUser?: string;
  createDate?: string;
  updateDate?: string;
  phoneNumber: string;
  jobTitle: string;
  phoneExtension: string;
  alternatePhoneNumber: string;
  alternatePhoneExtension: string;
  email: string;
  firstName: string;
  lastName: string;
  effectiveDate?: string;
  expiryDate?: string;
}

export interface Grade {
  createUser: string;
  updateUser: string;
  createDate: string;
  updateDate: string;
  schoolGradeCode: string;
  schoolGradeId: string;
  schoolId: string;
  // optional properties
  label?: string;
  description?: string;
  displayOrder?: number | string;
  effectiveDate?: string;
  expiryDate?: string;
}

export interface Address {
  addressLine1: string;
  addressLine2: string;
  addressTypeCode: string;
  city: string;
  countryCode: string;
  createDate?: string;
  createUser?: string;
  districtAddressId?: string;
  districtId?: string;
  postal: string;
  provinceCode: string;
  updateDate?: string;
  updateUser?: string;
}

// CODES
export interface CategoryCode extends Code {
  schoolCategoryCode: string;
}

export interface FacilityCode extends Code {
  facilityTypeCode: string;
}

export interface AddressTypeCode extends Code {
  addressTypeCode: string;
}

export interface GradeCode extends Code {
  schoolGradeCode: string;
}

export interface DistrictContactTypeCode extends Code {
  districtContactTypeCode: string;
}

export interface AuthorityContactTypeCode extends Code {
  authorityContactTypeCode: string;
}

export interface SchoolContactTypeCode extends Code {
  schoolContactTypeCode: string;
}

export interface ContactTypeCode {
  codesList: {
    authorityContactTypeCodes: AuthorityContactTypeCode[];
    districtContactTypeCodes: DistrictContactTypeCode[];
    schoolContactTypeCodes: SchoolContactTypeCode[];
  }

}

// SCHOOL

export interface SchoolContact extends Contact {
  schoolContactId: string;
  schoolId: string;
  schoolContactTypeCode: string;
}

export interface School {
  createDate?: string;
  createUser?: string;
  id?: number;
  name: string;
  mincode: string;
  displayName: string;
  displayNameNoSpecialChars?: string;
  districtId?: string;
  email: string;
  facilityTypeCode: string;
  faxNumber: string;
  independentAuthorityId?: string;
  mincode: string;
  openDate?: string;
  phoneNumber: string;
  schoolCategoryCode: string;
  schoolId?: string;
  schoolNumber?: string;
  schoolOrganizationCode?: string;
  schoolReportingRequirementCode?: string;
  updateDate?: string;
  updateUser?: string;
  website: string;
  neighborhoodLearning?: [];
  grades: Grade[];
  contacts: SchoolContact[];
  addresses: Address[];
  fundingGroupSubCode: string;
  fundingGroupCode: string;
  notes?: [];
}

export interface ListSchool {
  displayName: string;
  mincode: string;
  schoolId: string;
}

// DISTRICT

// TODO: create generic interface and extend for district contact specifics; need authority and school contacts.
export interface DistrictContact {
  districtContactId: string;
  districtId: string;
  districtContactTypeCode: string;
}

export interface District {
  districtData: {
    createDate: string;
    createUser: string;
    displayName: string;
    districtId: string;
    districtNumber: string;
    districtRegionCode: string;
    districtStatusCode: string;
    email: string;
    faxNumber: string;
    phoneNumber: string;
    updateDate: string;
    updateUser: string;
    website: string;
    notes: [];
    contacts: DistrictContact[];
    addresses: Address[];
  };
  districtSchools: School[]
}

// used to define lightweight list of all districts for UI components
export interface ListDistrict {
  displayName: string;
  districtNumber: string;
  districtId: string;
}


// AUTHORITY

export interface AuthorityContact extends Contact {
  authorityContactId: string;
  independentAuthorityId: string;
  authorityContactTypeCode: string;
}
export interface Note {
  createUser: string;
  updateUser: string;
  createDate: string;
  updateDate: string;
  noteId: string;
  schoolId: string;
  districtId: string | null;
  independentAuthorityId: string | null;
  content: string;
}
export interface Authority {
  authorityData: {
    authorityNumber: string;
    authorityTypeCode: string;
    closedDate?: string;
    createDate: string;
    createUser: string;
    displayName: string;
    email: string;
    faxNumber: string;
    independentAuthorityId: string;
    openedDate: string;
    phoneNumber: string;
    updateDate: string;
    updateUser: string;
    addresses: Address[];
    contacts: AuthorityContact[];
    notes: [];
  }
  authoritySchools: School[];
}

export interface ListAuthority {
  displayName: string;
  authorityNumber: string;
  independentAuthorityId: string;
}

