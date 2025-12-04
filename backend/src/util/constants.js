const FILTER_OPERATION = Object.freeze(
  {
    /**
     * Equal filter operation.
     */
    EQUAL: 'eq',
    /**
     * Not equal filter operation.
     */
    NOT_EQUAL: 'neq',
    /**
     * Not equal column filter operation.
     */
    NOT_EQUAL_OTHER_COLUMN: 'neqc',
    /**
     * Greater than filter operation.
     */
    GREATER_THAN: 'gt',
    /**
     * Greater than or equal to filter operation.
     */
    GREATER_THAN_OR_EQUAL_TO: 'gte',
    /**
     * Less than filter operation.
     */
    LESS_THAN: 'lt',
    /**
     * Less than or equal to filter operation.
     */
    LESS_THAN_OR_EQUAL_TO: 'lte',
    /**
     * In filter operation.
     */
    IN: 'in',
    /**
     * Filter to return when none of the child records includes the values
     */
    NONE_IN: 'none_in',
    /**
     * Not in filter operation.
     */
    NOT_IN: 'nin',
    /**
     * Between filter operation.
     */
    BETWEEN: 'btn',
    /**
     * Contains filter operation.
     */
    CONTAINS: 'like',
    /**
     * Contains ignore case filter operation.
     */
    CONTAINS_IGNORE_CASE: 'like_ignore_case',
    /**
     * Starts with filter operation.
     */
    STARTS_WITH: 'starts_with',
    /**
     * Not starts with filter operation.
     */
    NOT_STARTS_WITH: 'not_starts_with',
    /**
     * Starts with ignore case filter operation.
     */
    STARTS_WITH_IGNORE_CASE: 'starts_with_ignore_case',
    /**
     * Ends with filter operation.
     */
    ENDS_WITH: 'ends_with',
    IN_LEFT_JOIN: 'in_left_join',
    NONE_IN_DISTRICT: 'none_in_district',
    CUSTOM_CHILD_JOIN: 'custom_child_join',
    EQUAL_WITH_LEFT_JOIN: 'eq_lj'
  }
);
const CONDITION = Object.freeze(
  {
    /**
     * And condition.
     */
    AND: 'AND',
    /**
     * Or condition.
     */
    OR: 'OR'
  }
);

const VALUE_TYPE = Object.freeze(
  {
    /**
     * String value type.
     */
    STRING: 'STRING',
    /**
     * Integer value type.
     */
    INTEGER: 'INTEGER',
    /**
     * Long value type.
     */
    LONG: 'LONG',
    /**
     * Date value type.
     */
    DATE: 'DATE',
    /**
     * Date time value type.
     */
    DATE_TIME: 'DATE_TIME',
    /**
     * Uuid value type.
     */
    UUID: 'UUID',

    BOOLEAN: 'BOOLEAN'
  }
);

const EVENT_TYPE = Object.freeze({
  UPDATE_STUDENT: 'UPDATE_STUDENT',
  CREATE_STUDENT: 'CREATE_STUDENT',
  UPDATE_SCHOOL: 'UPDATE_SCHOOL',
  CREATE_SCHOOL: 'CREATE_SCHOOL',
  UPDATE_DISTRICT: 'UPDATE_DISTRICT',
  CREATE_DISTRICT: 'CREATE_DISTRICT',
  UPDATE_AUTHORITY: 'UPDATE_AUTHORITY',
  CREATE_AUTHORITY: 'CREATE_AUTHORITY',
  COPY_USERS_TO_NEW_SCHOOL: 'COPY_USERS_TO_NEW_SCHOOL',
  GDC_FILE_UPLOAD_EVENT: 'GDC_FILE_UPLOAD_EVENT',
  UPDATE_GRAD_SCHOOL: 'UPDATE_GRAD_SCHOOL',
});

let cacheKeys;

cacheKeys = {
};
const CACHE_KEYS = Object.freeze(cacheKeys);


module.exports = {
  FILTER_OPERATION,
  CONDITION,
  EVENT_TYPE,
};
