//Base interface for common properties across different codes
interface Code {
  label: string,
  description: string,
  displayOrder: number | string,
  effectiveDate: string,
  expiryDate: string,
  legacyCode?: string,
}

interface CategoryCode extends Code {
  schoolCategoryCode: string;
}

interface FacilityCode extends Code {
  facilityTypeCode: string;
}

interface AddressTypeCode extends Code {
  addressTypeCode: string;
}

interface GradeCode extends Code {
  schoolGradeCode: string,
}

interface DistrictContactTypeCode extends Code {
  districtContactTypeCode: string;
}

interface CodesList {
  authorityContactTypeCodes: [],
  districtContactTypeCodes: DistrictContactTypeCode[];
  schoolContactTypeCodes: [];
}

interface ContactTypeCode {
  codesList: CodesList,

}
