
// /js/Collections/FoodList.js

/**
  * @desc File that creates Backbone Collection that stores Food models for a given calender day
  * @author John Jordan johnjordan1985@gmail.com
  * @date 06 April 2016
*/

var app = app || {};

/**
  * A Collection of Food models
  * @constructor
  */

app.FoodCollection = Backbone.Collection.extend({
    model: app.Food,
});

//Collection to store returned search results

app.searchResults = new app.FoodCollection();
