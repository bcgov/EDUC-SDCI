"use strict";
const { LocalDateTime, DateTimeFormatter } = require("@js-joda/core");
const cacheService = require("../components/cache-service");

function generateSchoolObject(school = {}, gradeCodes = []) {
  const now = new Date();
  // Filter active contacts based on effective and expiry dates
  const activeContacts = (school.contacts || []).filter(
    ({ effectiveDate, expiryDate }) => {
      const effective = new Date(effectiveDate);
      const expiry = expiryDate ? new Date(expiryDate) : null;
      return effective <= now && (!expiry || expiry >= now);
    }
  );

  // Extract existing grade codes from school.grades
  const allSchoolGrades = new Set(gradeCodes.map((g) => g.schoolGradeCode));
  const presentGrades = new Set(
    school?.grades?.map((g) => g.schoolGradeCode) || []
  );

  // Build the grade status object (GRADE: "Y" or "N")
  const gradeStatus = {};
  allSchoolGrades.forEach((code) => {
    gradeStatus[code] = presentGrades.has(code) ? "Y" : "N";
  });

  //Add Funding Codes
  return {
    schoolId: school.schoolId || null,
    districtId: school.districtId || null,
    mincode: school.mincode || null,
    independentAuthorityId: school.independentAuthorityId || null,
    schoolNumber: school.schoolNumber || null,
    faxNumber: school.faxNumber || null,
    phoneNumber: school.phoneNumber || null,
    email: school.email || null,
    website: school.website || null,
    schoolReportingRequirementCode:
      school.schoolReportingRequirementCode || null,
    vendorSourceSystemCode: school.vendorSourceSystemCode || null,
    displayName: school.displayName || null,
    displayNameNoSpecialChars: school.displayNameNoSpecialChars || null,
    schoolOrganizationCode: school.schoolOrganizationCode || null,
    schoolCategoryCode: school.schoolCategoryCode || null,
    facilityTypeCode: school.facilityTypeCode || null,
    openedDate: school.openedDate || null,
    closedDate: school.closedDate || null,
    canIssueCertificates: !!school.canIssueCertificates,
    canIssueTranscripts: !!school.canIssueTranscripts,
    contacts: activeContacts || [],

    ...gradeStatus, // if gradeStatus is inside school

    grades: school.grades || [],
    addresses: school.addresses || [],
    schoolFundingGroups: school.schoolFundingGroups || [],

    // New fields
    notes: school.notes || null,
    neighborhoodLearning: school.neighborhoodLearning || [],
    schoolMove: school.schoolMove || [],
    schoolCategoryCode_label: school.schoolCategoryCode_label || "Public",
    schoolCategoryCode_description:
      school.schoolCategoryCode_description || "Public School",
    faciltyTypeCode_label: school.faciltyTypeCode_label || "Provincial",
    faciltyTypeCode_description:
      school.faciltyTypeCode_description || "Provincial school",
    primaryK3: school.primaryK3 || "",
    elementary47: school.elementary47 || "",
    juniorSecondary810: school.juniorSecondary810 || "",
    seniorSecondary1112: school.seniorSecondary1112 || "",
  };
}

function isSchoolActive(school) {
  if (!school || !school.displayName || !school.openedDate) return false;

  const currentTime = LocalDateTime.now();
  const openedDate = LocalDateTime.parse(
    school.openedDate,
    DateTimeFormatter.ISO_LOCAL_DATE_TIME
  );
  const closedDate = school.closedDate
    ? LocalDateTime.parse(
        school.closedDate,
        DateTimeFormatter.ISO_LOCAL_DATE_TIME
      )
    : null;

  return (
    openedDate.isBefore(currentTime) &&
    (!closedDate || currentTime.isBefore(closedDate))
  );
}

module.exports = {
  generateSchoolObject,
  isSchoolActive,
};
