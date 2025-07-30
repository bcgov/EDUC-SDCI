'use strict';
const { LocalDateTime, DateTimeFormatter } = require('@js-joda/core');

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
    name: district.displayName,
    districtRegionCode: district.districtRegionCode,
    districtStatusCode: district.districtStatusCode,
    contacts: activeContacts,
    ...flattenedAddressFields
  };
}

function isDistrictActive(district) {
  return (district?.districtStatusCode?.toUpperCase() === 'ACTIVE');
}
module.exports = {
  generateDistrictObject,
  isDistrictActive,
};
