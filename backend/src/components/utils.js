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

function createList(list, fields) {
    return list
      .map(function (item) {
        if (item.closedDate !== null) {
          const itemData = {};
          fields.forEach(field => {
            itemData[field] = item[field];
          });
          return itemData;
        }
      })
      .filter(function (item) {
        return item !== undefined;
      });
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
  
  module.exports = { createList, isSafeFilePath, addDistrictLabels };