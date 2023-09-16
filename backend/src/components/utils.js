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
  'exceldistrictcontacts'
  // Add more allowed filepaths as needed
]);
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
  
  module.exports = { createList, isSafeFilePath, addDistrictLabels, districtNumberSort };