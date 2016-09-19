
// js/Collections/Days.js

/**
  * @desc File that creates Backbone Collection that stores the Day models for each calender day tracked
  * @author John Jordan johnjordan1985@gmail.com
  * @date 06 April 2016
*/

var app = app || {};

/**
  * A Collection of Day models
  * @constructor
  */

app.Days = Backbone.Collection.extend({
	model: app.Day,

	/**
	 * Used timeStamp attribute to sort models in chronological order, as merely using id as a sort key
	 * resulted in day Models being sorted by day only, rather than day/month/year
	*/

	sort_key: 'timeStamp',

	idAttribute:'_id',

	comparator: function(item){

		return item.get(this.sort_key);
	},
});