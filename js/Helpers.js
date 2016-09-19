
// js/Helpers.js

/**
  * @desc File containing various helper functions, for date formatting and various calculations
  * as well as variables for API requests.
  * @author John Jordan johnjordan1985@gmail.com
  * @date 06 April 2016
  */


var app = app || {};


//Variables for use in Nutritionx API request
app.applicationId = 'f6efb211';
app.applicationKey = '7604815a515187cab64d5f34285d54f4';
app.nutritionixUrlStart = 'https://api.nutritionix.com/v1_1/search/';
app.nutritionixUrlFields = '?results=0%3A10&cal_min=0&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id%2Cnf_total_fat%2Cnf_total_carbohydrate%2Cnf_protein%2Cnf_calories%2Cnf_serving_weight_grams%2Cnf_serving_size_unit%2Cnf_serving_size_qty&appId=f6efb211&appKey=7604815a515187cab64d5f34285d54f4';

/**
  * @desc Helper function that notifies user of changes they have made to their tracked foods
  * @param {string} message - Message to user
  * @param {array} foodList - List of foods
  * @param {string} elementId - DOM element id that message will be displayed withing
  * @param {string} backgroundColour - Optional colour specification, in three-character hexadecimal notation,
  * with the default being a green background
  */
app.notifyUser =  function(message, foodList, elementId, backgroundColour) {
    if (typeof backgroundColour === 'undefined' || backgroundColour === 'green') {
        backgroundColour = '#3c3';
    }
    if(backgroundColour === 'red'){
        backgroundColour = '#f22';
    }
    if(backgroundColour === 'other'){
        backgroundColour = '#f72';
    }
    //Changed all alerts to having an orange background.
    backgroundColour = '#f72';
    var DOMelement = $(elementId);
    var messageIntro;
    //Clears out previous messages
    DOMelement.empty();
    DOMelement.css('background-color', backgroundColour);
    messageIntro = message + '<br>';
    DOMelement.prepend(messageIntro);
    foodList.forEach(function(food){
        DOMelement.append('- ' + food.get('brand') + '<i> (' +  food.get('type') +')</i><br>');
    }, this);
};

/**
  * @ desc Helper to notify user in event of day being edited
  * @param {string} message - Message to user
  * @param {string} day - Date string of currently edited day
  * @param {string} elementId - DOM element id that message will be displayed withing
  * @param {string} backgroundColour - Optional colour specification, in three-character hexadecimal notation,
  * with the default being a green background
  */

app.notifyUserDayEdited = function(message, day, elementId, backgroundColour){
    if (typeof backgroundColour === 'undefined') {
        backgroundColour = '#3c3';
    }
    if (typeof backgroundColour === 'undefined' || backgroundColour === 'green') {
        backgroundColour = '#3c3';
    }
    if(backgroundColour === 'red'){
        backgroundColour = '#f22';
    }
    if(backgroundColour === 'other'){
        backgroundColour = '#f72';
    }

    //Changed all alerts to having an orange background.

    backgroundColour = '#f72';
    var DOMelement = $(elementId);
    var messageIntro;
    //Clears out previous messages
    DOMelement.empty();
    DOMelement.css('background-color', backgroundColour);
    messageIntro = message + '<br>';
    DOMelement.prepend(messageIntro);
    DOMelement.append(day);
};

/**
  * @ desc Helper to notify user in event of invalid input in date range fields
  */
app.notifyUserOfInvalidDates =  function(firstMessage, secondMessage, array, elementId, backgroundColour) {
    if (typeof backgroundColour === 'undefined' || backgroundColour === 'green') {
        backgroundColour = '#3c3';
    }
    if(backgroundColour === 'red'){
        backgroundColour = '#f22';
    }
    if(backgroundColour === 'other'){
        backgroundColour = '#f72';
    }

    //Changed all alerts to having an orange background.

    backgroundColour = '#f72';

    var DOMelement = $(elementId);
    var messageIntro;
    //Clears out previous messages
    DOMelement.empty();
    DOMelement.css('background-color', backgroundColour);
    messageIntro = firstMessage + '<br>';
    DOMelement.prepend(messageIntro);
    array.forEach(function(date){
        DOMelement.append('- ' + date +'<br>');
    }, this);
    DOMelement.append(secondMessage);
};

var app = app || {};
app.dayNames = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

/**
  * @desc Helper that sets Date object to 00:00 hours on passed in day. This is used to determine if
  * a new day has, or new days have, happened since the day of creation of the dailyTrackedFoods collection
  * @params {Date Object} myDate - Date passed into function
  * @returns {Date Object} myDate - modified input date object
  */

app.setToZeroHours = function(myDate){
    //Set hours, minutes, seconds, milliseconds to zero
    myDate.setHours(0,0,0,0);
    return myDate;
};

app.oneHour = 60*60*1000; //Minutes, seconds, milliseconds

/**
  * @desc Calculates number of hours between two dates
  * @param {date object} b - first date
  * @param {date object} a - second date
  * @returns {Number} Floored difference in hours
  */

app.diffHours = function(b,a) {
    //Difference between dates is scaled in terms of one hour, as expressed by
    //app.oneHour. Math.floor() used to ensure a new day is started only after the
    //stroke of midnight
    return Math.floor( Math.abs( (b.getTime() - a.getTime())/app.oneHour));
};

app.oneDay = 24*60*60*1000; //Hours, minutes, seconds, milliseconds

/**
  * @desc Calculates number of days between two dates
  * @param {Date object} b - first date
  * @param {Date object} a - second date
  * @returns {Number} Rounded up difference in days
  */

app.diffDays = function(b,a){

    //Difference between dates is scaled in terms of one day, as expressed by
    //app.oneDay. Used ceil() to ensure consistant rounding of days
    return Math.ceil( Math.abs( (b.getTime() - a.getTime())/app.oneDay));
};

/**
  * @desc Returns day of week for a given date object
  * @param {Date object} day - Passed in date object
  * @returns {String} today - Day of week, abbreviated
  */

app.getDay = function(day){
    var today;
    if ( typeof(day) === 'undefined'){

        today = new Date();
    } else {

        today = day;
    }

    today = app.dayNames[today.getDay()];

    return today;
};


// app.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

app.monthNames = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
/**
  * @desc Returns formatted date string for given date object
  * @param {Date object} date - Passed in date object
  * @returns {String} today - Formatted date, 'DD Month YYYY', e.g. '01 March 2016'
  */

app.getTodaysDateFormatted = function(date){
    var today;
    //'date' parameter is a Date object, which is optional. Default value is todays date.
    if ( typeof(date) === 'undefined') {
        //Create date object
        today = new Date();
    } else {

        today = date;
    }
    var day = today.getDate();

    //January is indexed at zero
    var month = today.getMonth();

    //Converts 'month' variable from number to name of month, by indexing global
    //array of month names
    month = app.monthNames[month];
    var year = today.getFullYear();

    //Checks if date is less than '10' and therefore has only
    //one digit
    if ( day < 10 ){

        //Adds a leading zero to day
        day = '0' + day;
    }

    //Again, checks if month variable requires a leading zero
    if ( month < 10 ){
        month = '0' + month;
    }

    today = day + ' ' + month + ' ' + year;

    return today;
};

/**
  * @desc Creates a Date object set in the past or future, based on parameter value
  * @param {increment} integer - Negative integers represent past dates, positive ones future ones
  * @returns {Date object} today - Incremented date
  */

app.getIncrementedDate = function(increment){

    if ( typeof(increment) === 'undefined' ){
        increment = 0;
    }

    //Create date object
    var today = new Date();

    //Using inbuilt getters and setters, add increment to Date object
    today.setDate(today.getDate() + increment);

    //Return Date object
    return today;

};

/**
  * @desc Creates a time stamp for Backbone model
  * @param {Object} model - Backbone model
  * @returns {Object} today - Timestamped Backbone model
  */
app.timeStampAModel =  function(model){

    // Create new date from model's date-based id attribute
    var dateObject = new Date(model.get('id'));

    // Get date in milliseconds for quantative comparison in future sorting procedure
    var timeStampInMilliSeconds = dateObject.getTime();

    // Time stamp model
    model.set({
        timeStamp: timeStampInMilliSeconds
    });

};
