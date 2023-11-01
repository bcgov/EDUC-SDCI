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
  'publicschoolcontacts',
  'independentschoolcontacts',
  'allschoolcontacts'
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
  function formatGrades(grades, schoolGrades) {
    const result = {};

    // Create a set of all school grade codes from the provided grades
    const gradeCodesSet = new Set(grades.map(grade => grade.schoolGradeCode));
  
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
  function rearrangeAndRelabelObjectProperties(object, propertyList) {
      const reorderedObject = {};
      propertyList.forEach((propertyInfo) => {
          const prop = propertyInfo.property;
          const label = propertyInfo.label;
          reorderedObject[label] = object.hasOwnProperty(prop) ? object[prop] : "";
      });
      return reorderedObject;
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

        // Merge the address fields and nlc into the school object
        Object.assign(school, convertedGrades, addressFields.mailing, addressFields.physical, { nlc });

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
        const propertyOrder = [
          { property: "districtNumber", label: "District Number" },
          { property: "mincode", label: "School Code" },
          { property: "displayName", label: "School Name" },
          { property: "mailing_addressLine1", label: "Address" },
          { property: "mailing_city", label: "City" },
          { property: "mailing_provinceCode", label: "Province" },
          { property: "mailing_postal", label: "Postal Code" },
          // { property: "principalTitle", label: "Principal Title" },
          { property: "firstName", label: "Principal First Name" },
          { property: "lastName", label: "Principal Last Name" },
          { property: "schoolCategoryCode", label: "Type" },
          // { property: "gradeRange", label: "Grade Range" },
          // { property: "schoolCategory", label: "School Category" },
          // { property: "fundingGroups", label: "Funding Group(s)" },
          { property: "phoneNumber", label: "Phone" },
          // { property: "fax", label: "Fax" },
          { property: "email", label: "Email" },
          { property: "GRADE01", label: "Grade 1 Enrollment" },
          { property: "GRADE02", label: "Grade 2 Enrollment" },
          { property: "GRADE03", label: "Grade 3 Enrollment" },
          { property: "GRADE04", label: "Grade 4 Enrollment" },
          { property: "GRADE05", label: "Grade 5 Enrollment" },
          { property: "GRADE06", label: "Grade 6 Enrollment" },
          { property: "GRADE07", label: "Grade 7 Enrollment" },
          { property: "GRADE08", label: "Grade 8 Enrollment" },
          { property: "GRADE09", label: "Grade 9 Enrollment" },
          { property: "GRADE10", label: "Grade 10 Enrollment" },
          { property: "GRADE11", label: "Grade 11 Enrollment" },
          { property: "GRADE12", label: "Grade 12 Enrollment" }
          
          
      ];
        const schools = rearrangeAndRelabelObjectProperties(school,propertyOrder)
        return schools;
    });
}
  module.exports = {removeFieldsByCriteria, createList, isSafeFilePath,isAllowedSchoolCategory, addDistrictLabels, districtNumberSort, createSchoolCache, formatGrades};