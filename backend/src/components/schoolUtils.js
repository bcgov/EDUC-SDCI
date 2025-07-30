'use strict';
const { LocalDateTime, DateTimeFormatter } = require('@js-joda/core');

function generateSchoolObject(school = {}, gradeCodes = []) {
  const now = new Date();

  // Filter active contacts based on effective and expiry dates
  const activeContacts = (school.contacts || []).filter(({ effectiveDate, expiryDate }) => {
    const effective = new Date(effectiveDate);
    const expiry = expiryDate ? new Date(expiryDate) : null;
    return effective <= now && (!expiry || expiry >= now);
  });

  // Extract existing grade codes from school.grades
  const allSchoolGrades = new Set(gradeCodes.map(g => g.schoolGradeCode));
  const presentGrades = new Set(school?.grades?.map(g => g.schoolGradeCode) || []);

  // Build the grade status object (GRADE: "Y" or "N")
  const gradeStatus = {};
  allSchoolGrades.forEach(code => {
    gradeStatus[code] = presentGrades.has(code) ? 'Y' : 'N';
  });

  //Add Funding Codes
  

  return {
    schoolId: school.schoolId || null,
    districtId: school.districtId || null,
    mincode: school.mincode || null,
    independentAuthorityId: school.independentAuthorityId || null,
    schoolNumber: school.schoolNumber || null,
    displayName: school.displayName || null,
    displayNameNoSpecialChars: school.displayNameNoSpecialChars || null,
    schoolCategoryCode: school.schoolCategoryCode || null,
    facilityTypeCode: school.facilityTypeCode || null,
    openedDate: school.openedDate || null,
    closedDate: school.closedDate || null,
    canIssueCertificates: !!school.canIssueCertificates,
    canIssueTranscripts: !!school.canIssueTranscripts,
    contacts: activeContacts,
    ...gradeStatus,
    primaryK3: school.primaryK3, 
    elementary47: school.elementary47,
    juniorSecondary810: school.juniorSecondary810,
    seniorSecondary1112: school.seniorSecondary1112, 
  };
}

function isSchoolActive(school) {
  if (!school || !school.displayName || !school.openedDate) return false;

  const currentTime = LocalDateTime.now();
  const openedDate = LocalDateTime.parse(school.openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
  const closedDate = school.closedDate
    ? LocalDateTime.parse(school.closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
    : null;

  return openedDate.isBefore(currentTime) &&
    (!closedDate || currentTime.isBefore(closedDate));
}

module.exports = {
  generateSchoolObject,
  isSchoolActive
};