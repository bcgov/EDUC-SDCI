'use strict';

const config = require('../config/index');

const roles = {
  User: {
    //Help functions created in auth module: isValidStudentSearchUserToken, isValidStudentSearchUser
    StudentSearch: config.get('server:studentSearch:roleAdmin'),
    //Help functions created in auth module: isValidStaffAdministrationUser
    StaffAdministration: config.get('server:administration:roleAdmin'),
  },
  Admin: {
      //Help functions created in auth module: isValidStudentSearchAdmin
      StudentSearch: config.get('server:studentSearch:roleAdmin'),
      //Help functions created in auth module: isValidStaffAdministrationAdmin
      StaffAdministration: config.get('server:administration:roleAdmin'),
      StaffInfoOfficer: config.get('server:administration:roleInfoOfficer'),
      StaffGradProgramBA: config.get('server:administration:roleGradProgramAreaBA'),
      
  }
};

module.exports = roles;
