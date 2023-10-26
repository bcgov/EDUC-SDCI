const ALLOWED_FILENAMES = new Set([
  'trans',
  'independent-authority-rep',
  'indigenous',
  'continuing-custody-order',
  'distributed-learning',
  'online-learning-contact',
  'early-learning-child-care',
  'planning-officer',
  'early-learning',
  'facilities',
  'financial',
  'french',
  'international-education',
  'literacy',
  'myed-bc',
  'inclusive-education',
  'transportation',
  'superintendent',
  'chairperson',
  'secretary-treasurer',
  'executive-admin-assistant',
  'exceldistrictcontacts',
  'excelschoolcontacts'
  // Add more allowed filepaths as needed
]);
const ALLOWED_SCHOOLCATEGORYCODES = new Set([
  'PUBLIC',
  'INDEPEND'
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
    sortField = null
  } = options;

  const filteredList = list
    .filter(function (item) {
      // Change the condition from removal to inclusion
      return (!fieldToInclude || item[fieldToInclude] === valueToInclude);
    })
    .map(function (item) {
      const itemData = {};
      fields.forEach(field => {
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

function addDistrictLabels(jsonData, districtList) {
    if (jsonData.content && Array.isArray(jsonData.content)) {
      jsonData.content.forEach(dataItem => {
        const district = districtList.find(item => item.districtId === dataItem.districtId);
        if (district) {
          dataItem.districtNumber = district.districtNumber;
          dataItem.displayName = district.displayName;
        }
      });
    }
    return jsonData
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
  function createSchoolCache(schoolData, schoolGrades) {
    const propertyOrder = ["mincode", "schoolNumber","mailing_addressLine1","mailing_addressLine2","mailing_postal","mailing_provinceCode","mailing_countryCode"];

    // Preload convertedGrades with schoolGrades.schoolGradeCode and set the value to "N"
    const convertedGrades = {};
    schoolGrades.forEach((grade) => {
        convertedGrades[grade.schoolGradeCode] = "N";
    });

    // Map over each school object
    return schoolData.map((school) => {
        const addressFields = {
            mailing: {},
            physical: {},
        };

        // Loop through the grades and set the value to "Y" for each grade
        school.grades.forEach((grade) => {
            convertedGrades[grade.schoolGradeCode] = "Y";
        });

        // Extract and format principal contact information if it exists
        const principalContact = school.contacts.find((contact) => contact.schoolContactTypeCode === "PRINCIPAL");
        if (principalContact) {
            school.firstName = principalContact.firstName;
            school.lastName = principalContact.lastName;
            school.email = principalContact.email;
            school.phoneNumber = principalContact.phoneNumber;
        }

        // Loop through addresses and update the fields based on addressTypeCode
        school.addresses.forEach((address) => {
            if (address.addressTypeCode === "MAILING") {
                Object.keys(address).forEach((field) => {
                    // Exclude the specified fields
                    if (![
                        "createUser",
                        "updateUser",
                        "createDate",
                        "updateDate",
                        "schoolAddressId",
                        "schoolId",
                        "addressTypeCode"
                    ].includes(field)) {
                        addressFields.mailing[`mailing_${field}`] = address[field];
                    }
                });
            } else if (address.addressTypeCode === "PHYSICAL") {
                Object.keys(address).forEach((field) => {
                    if (![
                        "createUser",
                        "updateUser",
                        "createDate",
                        "updateDate",
                        "schoolAddressId",
                        "schoolId",
                        "addressTypeCode"
                    ].includes(field)) {
                        addressFields.mailing[`physical_${field}`] = address[field];
                    }
                });
            }
        });

        // Concatenate neighborhoodLearningTypeCode into a single string
        const nlc = school.neighborhoodLearning.map(learning => learning.neighborhoodLearningTypeCode).join(' | ');

        // Create a new object with the properties rearranged
        const rearrangedSchool = {};
        propertyOrder.forEach((prop) => {
            rearrangedSchool[prop] = school[prop];
        });

        // Merge the address fields and nlc into the school object
        Object.assign(rearrangedSchool, convertedGrades, addressFields.mailing, addressFields.physical, { nlc });

        return rearrangedSchool;
    });
}
  module.exports = { createList, isSafeFilePath,isAllowedSchoolCategory, addDistrictLabels, districtNumberSort, createSchoolCache };