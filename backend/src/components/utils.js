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
  'executive-admin-assistant'
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

  
  module.exports = { createList, isSafeFilePath };