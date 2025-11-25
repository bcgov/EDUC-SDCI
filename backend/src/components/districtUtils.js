'use strict';
const { LocalDate, LocalDateTime, DateTimeFormatter } = require('@js-joda/core');


function generateAuthorityObject(authority) {
  return {
    authorityID: authority.independentAuthorityId,
    authorityNumber: authority.authorityNumber,
    displayName: authority.displayName,
    openedDate: authority.openedDate,
    closedDate: authority.closedDate,
  };
}

function isAuthorityActive(authority) {
  try {
    if (!authority || !authority.displayName) return false;

    const currentDate = LocalDate.now();
    const openedDate = authority?.openedDate;
    const closedDate = authority?.closedDate;

    if (!openedDate) return false;

    // Parse as LocalDateTime, then convert to LocalDate
    const opened = LocalDateTime.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME).toLocalDate();
    const closed = closedDate
      ? LocalDateTime.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME).toLocalDate()
      : null;

    const isActive =
      !currentDate.isBefore(opened) &&
      (!closed || currentDate.isBefore(closed));

    return isActive;
  } catch (error) {
    console.error("Error in isAuthorityActive:", error);
    return false;
  }
}

function generateDistrictObject(district = {}) {
  const now = new Date();
  const activeContacts = (district.contacts || []).filter(({ effectiveDate, expiryDate }) => {
    const effective = new Date(effectiveDate);
    const expiry = expiryDate ? new Date(expiryDate) : null;
    return effective <= now && (!expiry || expiry >= now);
  });
  

  const excludedKeys = ['createUser', 'updateUser', 'createDate', 'updateDate'];
  const flattenedAddressFields = {};
  
  (district.addresses || []).forEach(address => {
    const prefix = address.addressTypeCode?.toLowerCase();
    if (prefix) {
      Object.entries(address).forEach(([key, value]) => {
        if (key !== 'addressTypeCode' && !excludedKeys.includes(key)) {
          flattenedAddressFields[`${prefix}${key.charAt(0).toUpperCase() + key.slice(1)}`] = value;
        }
      });
    }
  });

  return {
    districtId: district.districtId,
    districtNumber: district.districtNumber,
    displayName: district.displayName,
    districtRegionCode: district.districtRegionCode,
    districtStatusCode: district.districtStatusCode,
    contacts: activeContacts,
    ...flattenedAddressFields,
    createUser: district.createUser,
    updateUser: district.updateUser,
    createDate: district.createDate,
    updateDate: district.updateDate,
    faxNumber: district.faxNumber,
    phoneNumber: district.phoneNumber,
    email: district.email,
    website: district.website,
    addresses: district.addresses,
    
  };
}

function isDistrictActive(district) {

  return (district?.districtStatusCode?.toUpperCase() === 'ACTIVE');
}
function isBCDistrict(districtData) {
  // Return true if districtNumber is NOT 102, 103, or 098
  return !['102', '103', '098'].includes(String(districtData?.districtNumber));
}

module.exports = {
  generateDistrictObject,
  isDistrictActive,
  generateAuthorityObject,
  isAuthorityActive,
  isBCDistrict
  
};
