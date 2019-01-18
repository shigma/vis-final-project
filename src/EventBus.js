/**
 * Some Used Events:
 * 1. keyword-changed
 *    This event is emitted when the user clicks a keyword somewhere in the app
 *    Parameter: Object {
 *        keyword: String, represents the new keyword
 *        tag: String, for custom tagging
 *    }
 * 2. user-changed
 *    This event is emitted when the user clicks a user somewhere in the app
 *    Parameter: Object {
 *        userId: Number, the user ID that uniquely identify a user
 *        tag: String, for custom tagging
 *    }
 * 3. date-filter-changed
 *    This event is emitted when the user specifies a new date range in the app
 *    Parameter: Object {
 *        beginDate: Date, must be Javascript Date() Object
 *        endDate: Date, must be Javascript Date() Object
 *        tag: String, for custom tagging
 *    }
 * 4. resize
 *    Emitted when layout changed.
 */
module.exports = new Vue();