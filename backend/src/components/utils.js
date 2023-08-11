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
  
  module.exports = { createList };