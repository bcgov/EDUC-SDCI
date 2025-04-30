const ALLOWED_FILENAMES = new Set([
  "districtcontacts",
  "districtmailing",
  "publicschoolcontacts",
  "independentschoolcontacts",
  "allschoolcontacts",
  "allschoolmailing",
  "authoritycontacts",
  "authoritymailing",
  "offshoreschoolrepresentatives",
  // Add more allowed filepaths as needed
]);

const ALLOWED_SCHOOLCATEGORYCODES = new Set([
  "PUBLIC",
  "INDEPEND",
  "OFFSHORE",
  // Add more allowed filepaths as needed
]);
function isAllowedSchoolCategory(category) {
  return ALLOWED_SCHOOLCATEGORYCODES.has(category);
}
function isSafeFilePath(filepath) {
  return ALLOWED_FILENAMES.has(filepath);
}

function createList(list, options = {}) {
  const {
    fields = [],
    fieldToInclude = null, // Updated option name
    valueToInclude = null, // Updated option name
    sortFunction = null,
    sortField = null,
  } = options;

  const filteredList = list
    .filter(function (item) {
      // Change the condition from removal to inclusion
      return !fieldToInclude || item[fieldToInclude] === valueToInclude;
    })
    .map(function (item) {
      const itemData = {};
      fields.forEach((field) => {
        itemData[field] = item[field];
      });
      return itemData;
    });

  // Sort the filtered list using the custom sort function if provided
  if (sortField) {
    filteredList.sort((a, b) => {
      const aField = a[sortField];
      const bField = b[sortField];
      if (aField < bField) return -1;
      if (aField > bField) return 1;
      return 0;
    });
  }

  return filteredList;
}
function removeFieldsByCriteria(inputData, criteria) {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return inputData; // Return the original data if the criteria is empty or not an array.
  }

  // Loop through the criteria and filter the fields based on the specified conditions.
  for (const item of criteria) {
    inputData = inputData.filter((itemData) => {
      if (itemData[item.fieldToRemove] !== item.value) {
        return true; // Keep the field if the condition is not met.
      }
    });
  }

  return inputData;
}
function appendMailingAddressDetailsAndRemoveAddresses(data) {
  if (data && data.addresses && data.addresses.length > 0) {
    const physicalAddress = data.addresses?.find(
      (address) => address.addressTypeCode === "PHYSICAL"
    );
    if (physicalAddress) {
      // Extract specific name-value pairs from the mailing address
      const {
        addressLine1,
        addressLine2,
        city,
        postal,
        provinceCode,
        countryCode,
      } = physicalAddress;

      // Add these name-value pairs to the original district object
      data.physicalAddressLine1 = addressLine1;
      data.physicalAddressLine2 = addressLine2;
      data.physicalCity = city;
      data.physicalPostal = postal;
      data.physicalProvinceCode = provinceCode;
      data.physicalCountryCode = countryCode;

      // Remove the "addresses" property
    }
    const courierAddress = data.addresses?.find(
      (address) => address.addressTypeCode === "MAILING"
    );
    if (courierAddress) {
      // Extract specific name-value pairs from the mailing address
      const {
        addressLine1,
        addressLine2,
        city,
        postal,
        provinceCode,
        countryCode,
      } = courierAddress;

      // Add these name-value pairs to the original district object
      data.mailingAddressLine1 = addressLine1;
      data.mailingAddressLine2 = addressLine2;
      data.mailingCity = city;
      data.mailingPostal = postal;
      data.mailingProvinceCode = provinceCode;
      data.mailingCountryCode = countryCode;

      // Remove the "addresses" property
    }
    delete data.addresses;
    delete data.contacts;
  }
}
function addDistrictLabels(jsonData, districtList) {
  if (jsonData.content && Array.isArray(jsonData.content)) {
    jsonData.content.forEach((dataItem) => {
      const district = districtList?.find(
        (item) => item.districtId === dataItem.districtId
      );
      if (district) {
        dataItem.districtNumber = district.districtNumber;
        dataItem.districtName = district.displayName;
      }
    });
  }
  return jsonData;
}

function districtNumberSort(a, b) {
  // Convert the strings to numbers for comparison
  const numA = parseInt(a, 10);
  const numB = parseInt(b, 10);

  if (numA < numB) {
    return -1;
  }
  if (numA > numB) {
    return 1;
  }
  return 0;
}
function formatGrades(grades, schoolGrades) {
  const result = {};

  // Create a set of all school grade codes from the provided grades
  const gradeCodesSet = new Set(grades.map((grade) => grade.schoolGradeCode));

  // Include all school grade codes in the result object
  for (const grade of grades) {
    result[grade.schoolGradeCode] = "Y";
  }

  // Set the value to "N" for school grade codes not in the provided grades
  for (const grade of schoolGrades) {
    if (!gradeCodesSet.has(grade.schoolGradeCode)) {
      result[grade.schoolGradeCode] = "N";
    }
  }

  return result;
}

function sortJSONByDistrictNumber(districts) {
  return districts.slice().sort((a, b) => {
    const districtNumberA = a["District Number"] || "";
    const districtNumberB = b["District Number"] || "";
    return districtNumberA.localeCompare(districtNumberB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}
function sortJSONBySchoolCode(schools) {
  return schools.slice().sort((a, b) => {
    const schoolCodeA = a.mincode || "";
    const schoolCodeB = b.mincode || "";
    return schoolCodeA.localeCompare(schoolCodeB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

function sortByProperty(
  arr,
  propertyName,
  options = { numeric: true, sensitivity: "base" }
) {
  return arr.slice().sort((a, b) => {
    const valueA = a[propertyName] || "";
    const valueB = b[propertyName] || "";
    return valueA.localeCompare(valueB, undefined, options);
  });
}

function rearrangeAndRelabelObjectProperties(object, propertyList) {
  const reorderedObject = {};
  propertyList.forEach((propertyInfo) => {
    const prop = propertyInfo.property;
    const label = propertyInfo.label;
    reorderedObject[label] = object.hasOwnProperty(prop) ? object[prop] : "";
  });
  return reorderedObject;
}

function normalizeJsonObject(
  sourceArray,
  referenceArray,
  matchKey,
  condition,
  includeFields
) {
  return sourceArray.map((item) => {
    const matchingItem = referenceArray?.find(
      (info) =>
        info[matchKey] === item[matchKey] && (!condition || condition(info))
    );
    if (matchingItem) {
      return {
        ...item,
        ...includeFields.reduce((result, field) => {
          result[matchKey + "_" + field] = matchingItem[field];
          return result;
        }, {}),
      };
    }
    return item;
  });
}
function filterRemoveByField(data, field, valuesToExclude) {
  return data.filter((item) => !valuesToExclude.includes(item[field]));
}
function filterIncludeByField(data, field, valuesToInclude) {
  return data.filter((item) => valuesToInclude.includes(item[field]));
}

function filterByPubliclyAvailableCodes(jsonArray, fieldName, publicCodes) {
  // Filter the array based on the condition
  const filteredArray = jsonArray.filter((item) => {
    // Extract the field value (or use an empty string if the field is not present)
    const fieldValue = item[fieldName] || "";

    // Check if the fieldValue exactly matches any string from the stringsToRemove array
    return publicCodes.includes(fieldValue);
  });

  return filteredArray;
}
function filterByField(jsonArray, fieldName, stringsToRemove) {
  // Filter the array based on the condition
  const filteredArray = jsonArray.filter((item) => {
    // Extract the field value (or use an empty string if the field is not present)
    const fieldValue = item[fieldName] || "";

    // Check if the fieldValue exactly matches any string from the stringsToRemove array
    return !stringsToRemove.includes(fieldValue);
  });

  return filteredArray;
}
function filterByOpenedAndClosedDate(data) {
  const currentDate = new Date();

  return data.filter((item) => {
    const closedDate = item.closedDate ? new Date(item.closedDate) : null;
    const openedDate = item.openedDate ? new Date(item.openedDate) : null;

    return (
      (closedDate === null && currentDate > openedDate) ||
      (currentDate < closedDate && currentDate > openedDate)
    );
  });
}
function filterByExpiryDate(data) {
  const currentDate = new Date();

  return data.filter((item) => {
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
    const effectiveDate = item.effectiveDate
      ? new Date(item.effectiveDate)
      : null;

    return (
      (expiryDate === null && currentDate > effectiveDate) ||
      (currentDate < expiryDate && currentDate > effectiveDate)
    );
  });
}
function getArrayofNonPubliclyAvailableCodes(codes, field) {
  if (!Array.isArray(codes)) {
    throw new Error("Invalid input. Expecting an array of objects.");
  }

  // Filter out objects where "publiclyAvailable" is false
  const nonPubliclyAvailableCodes = codes
    .filter((item) => item && item.publiclyAvailable !== true)
    .map((item) => item[field]);

  return nonPubliclyAvailableCodes;
}
function addFundingGroups(schools, fundingGroups) {
  try {
    // Process each school in the array
    const schoolsWithFunding = schools.map((school) => {
      // Find all matching funding groups by mincode
      const matchingFundingGroups = fundingGroups.filter(
        (fundingGroup) => fundingGroup.mincode === school.mincode
      );

      const schoolWithFunding = {
        ...school,
        primaryK3: "", // Replace with an appropriate default value
        elementary47: "", // Replace with an appropriate default value
        juniorSecondary810: "", // Replace with an appropriate default value
        seniorSecondary1112: "", // Replace with an appropriate default value
      };

      // Iterate through the matching funding groups
      matchingFundingGroups.forEach((matchingFundingGroup) => {
        // Access the fundingGroupCode and fundingSubCode properties
        const fundingGroupCode = matchingFundingGroup.fundingGroupCode;
        const fundingSubCode = matchingFundingGroup.fundingGroupSubCode;

        // Check the fundingSubCode and update the school information
        switch (fundingSubCode) {
          case "01":
            schoolWithFunding.primaryK3 = fundingGroupCode;
            break;
          case "04":
            schoolWithFunding.elementary47 = fundingGroupCode;
            break;
          case "08":
            schoolWithFunding.juniorSecondary810 = fundingGroupCode;
            break;
          case "11":
            schoolWithFunding.seniorSecondary1112 = fundingGroupCode;
            break;
          default:
            break;
        }
      });

      return schoolWithFunding;
    });

    return schoolsWithFunding;
  } catch (error) {
    // Handle the error here, you can log it or perform other actions
    console.error("An error occurred in addFundingGroups:", error);
    // Optionally, you can rethrow the error if needed
    throw error;
  }
}
function getArrayofPubliclyAvailableCodes(codes, field) {
  if (!Array.isArray(codes)) {
    throw new Error("Invalid input. Expecting an array of objects.");
  }

  // Filter out objects where "publiclyAvailable" is true
  const publiclyAvailableCodes = codes
    .filter((item) => item && item.publiclyAvailable === true)
    .map((item) => item[field]);

  return publiclyAvailableCodes;
}
function createSchoolCache(schoolData, schoolGrades) {
  // Preload convertedGrades with schoolGrades.schoolGradeCode and set the value to "N"

  // Map over each school object
  return schoolData.map((school) => {
    const convertedGrades = {};
    schoolGrades.forEach((grade) => {
      convertedGrades[grade.schoolGradeCode] = "N";
    });

    const addressFields = {
      mailing: {},
      physical: {},
    };

    // Loop through the grades and set the value to "Y" for each grade
    school.grades.forEach((grade) => {
      convertedGrades[grade.schoolGradeCode] = "Y";
    });

    // Extract and format principal contact information if it exists
    const currentDate = new Date();

    const principalContact = school.contacts?.find((contact) => {
      const effectiveDate = new Date(contact.effectiveDate);
      const expiryDate = contact.expiryDate ? new Date(contact.expiryDate) : null;
    
      return (
        contact.schoolContactTypeCode === "PRINCIPAL" &&
        effectiveDate <= currentDate &&
        (!expiryDate || expiryDate > currentDate)
      );
    });
    
    if (principalContact) {
      school.firstName = principalContact.firstName;
      school.lastName = principalContact.lastName;
    }

    // Loop through addresses and update the fields based on addressTypeCode
    school.addresses.forEach((address) => {
      if (address.addressTypeCode === "MAILING") {
        Object.keys(address).forEach((field) => {
          // Exclude the specified fields
          if (
            ![
              "createUser",
              "updateUser",
              "createDate",
              "updateDate",
              "schoolAddressId",
              "schoolId",
              "addressTypeCode",
            ].includes(field)
          ) {
            addressFields.mailing[`mailing_${field}`] = address[field];
          }
        });
      } else if (address.addressTypeCode === "PHYSICAL") {
        Object.keys(address).forEach((field) => {
          if (
            ![
              "createUser",
              "updateUser",
              "createDate",
              "updateDate",
              "schoolAddressId",
              "schoolId",
              "addressTypeCode",
            ].includes(field)
          ) {
            addressFields.mailing[`physical_${field}`] = address[field];
          }
        });
      }
    });

    // Concatenate neighborhoodLearningTypeCode into a single string
    const nlc = school.neighborhoodLearning
      .map((learning) => learning.neighborhoodLearningTypeCode)
      .join(" | ");

    // Merge the address fields and nlc into the school object
    Object.assign(
      school,
      convertedGrades,
      addressFields.mailing,
      addressFields.physical,
      { nlc }
    );

    // Remove the original grades property and the updated address object
    delete school.grades;
    delete school.addresses;
    delete school.neighborhoodLearning;
    delete school.createUser;
    delete school.updateUser;
    delete school.updateDate;
    delete school.createDate;
    delete school.schoolId;
    delete school.openedDate;
    delete school.closedDate;
    delete school.notes;
    delete school.schoolMove.createUser;
    delete school.schoolMove;

    // Remove the contacts property
    delete school.contacts;

    return school;
  });
}

function isActiveEntity(effective, expiry) {
  let today = new Date();
  return today > new Date(effective) && (!expiry || today < new Date(expiry));
}

module.exports = {
  addFundingGroups,
  filterByOpenedAndClosedDate,
  filterByPubliclyAvailableCodes,
  getArrayofPubliclyAvailableCodes,
  filterByExpiryDate,
  filterRemoveByField,
  filterIncludeByField,
  sortByProperty,
  getArrayofNonPubliclyAvailableCodes,
  filterByField,
  appendMailingAddressDetailsAndRemoveAddresses,
  sortJSONBySchoolCode,
  sortJSONByDistrictNumber,
  normalizeJsonObject,
  removeFieldsByCriteria,
  createList,
  isSafeFilePath,
  isAllowedSchoolCategory,
  addDistrictLabels,
  districtNumberSort,
  createSchoolCache,
  formatGrades,
  rearrangeAndRelabelObjectProperties,
  isActiveEntity,
};
