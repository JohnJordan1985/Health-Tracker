
/**
  * @desc File that triggers the entire application
  * @author John Jordan johnjordan1985@gmail.com
  * @date 06 April 2016
*/

var app = app || {};

$(function(){
    'use strict';

    /** Checks if localStorage exists and populates tracked food item list
      * with stored food items
      */

    if (localStorage.foods) {

        //Parse localStorage JSON data into variable
        var input = JSON.parse(localStorage.foods);

        //Create new Collection from parsed JSON data
        var collection = new app.FoodCollection(input);

        //Update daily food collection with saved data
        app.dailyTrackedFoods = collection;
    }
    app.appView = new app.AppView();
});