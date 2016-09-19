
// /js/Views/AnalysisView.js

/**
  * @desc File that creates 'Analysis' tab for application
  * that displays calorie and macronutrient breakdown for user's food intake
  * @author John Jordan johnjordan1985@gmail.com
  * @date 06 April 2016
  */

var app = app || {};

/**
  * @constructor
  */
app.AnalysisView = Backbone.View.extend({
    tagName: 'section',

    id: 'analysis',

    events: {
        'click button#toggle-totals': 'toggleTotalsAndAverages',

        'click button#todays-totals': 'getTodaysTotals',

        'click select': 'buildDropDownMenuOptions',

        'click button#cancel-range': 'emptyMessageDiv',

        'click button#add-range': 'pullDatesAndGetArrayOfDayModels',


        'click button#date-range-totals': function(e){
            //this.pullDatesAndGetArrayOfDayModels(e);
            // this.getAverageCalories(e);
            this.dateRangeConfirmation();
        }
    },

    template: _.template( $('#table-template').html() ),

    initialize: function(){
        this.todaysDate = app.getTodaysDateFormatted(new Date());
        this.todaysDay = app.getDay();
        this.calories = 0;
        this.protein = 0;
        this.fat  = 0;
        this.carbs = 0;
        _.bindAll(this, 'render', 'getTodaysTotals', 'resetTotals', 'percentTotalCalories', 'getDateRangeTotals', 'getAvailableDates', 'pullDatesAndGetArrayOfDayModels', 'updateModels', 'getAverageCalories', 'buildDropDownMenuOptions', 'dateRangeConfirmation', 'emptyMessageDiv', 'toggleTotalsAndAverages');
        this.listenTo(app.dailyTrackedFoods, 'change', this.render);
        $(this.el).html( this.template );
        $(this.el).prepend('<h1 id="user-message"></h1>');
        this.averageOrTotalsNotification = $("#average-or-totals", this.el);
        $(this.el).append('<button type="button" class="big-button" id="toggle-totals"> View Averages </button>');
        $(this.el).append('<button type="button" id="date-range-totals" class="big-button">View Date Range</button>');
        $(this.el).append("<button type='button' id='todays-totals' class='delete-day-button'> Reset </button>");
        this.todaysTotalsButton = $("#todays-totals", this.el);
        this.todaysTotalsButton.hide();
        this.toggleTotalsButton = $("#toggle-totals", this.el);
        this.toggleTotalsButton.hide();
        $(this.el).append('<p id="average-calories-container">You' + "'ve" + ' eaten <span id="average-calories"></span>, on average, over the date range selected</p>');
        // Cache references to the following DOM elements
        this.averageCaloriesContainer = $('#average-calories-container',this.el);
        this.averageCaloriesValue = $('#average-calories',this.el);
        this.averageCaloriesContainer.hide();
        /** Clicks Todays button to provide default date in table
          * when Analysis View initialized
          */
        $('#todays-totals').trigger('click');
        /** Call to this function in order to create an array of
          * available dates as source array for autocomplete
          */
        this.getAvailableDates();
        /** Adding autocomplete functionality to both date input boxes
          * using jQuery UI library 'autocomplete' function
          */
        $('#start-date-input', this.el).autocomplete({
            source: app.arrayOfAvailableDates
        });
        $('#end-date-input', this.el).autocomplete({
            source: app.arrayOfAvailableDates
        });
        this.calorieUnit = $("#calorie-units", this.el);

        // To create a clone of app.dayLog and include today's date as a new day Model
        app.collectionOfAvailableDatesIncludingToday = new app.Days(app.dayLog.models);
        this.updateModels();
        /** Set up listeners for both the dayLog and the dailyTrackedFoods as both
          * Collections contribute to app.collectionOfAvailableDatesIncludingToday
          */
        this.listenTo(app.dayLog, 'change add remove', this.updateModels);
        this.listenTo(app.dailyTrackedFoods, 'change add remove', this.updateModels);
        // Cache reference to user-message DOM element
        this.userMessage = $('#user-message', this.el);
        this.datesBeingDisplayed = $("#dates-being-displayed", this.el);
        this.numberOfDaysBeingDisplayed = $("#number-of-days", this.el);

        //Initial display of today's totals
        this.getTodaysTotals();

        this.getAvailableDates();

        // Variable used in hack to achieve proper drop-down menu functionality

        this.buildDropDownMenuCounter = 0;
        // Variable used to toggle calorie total/averages over a date range
        this.toggleCounter = 0;

    },

    render: function(){
        this.buildDropDownMenuOptions();

        /** Clear out any previous messages to the user,
          * as well as setting the background colour to default white
          */
        this.userMessage.empty();
        this.userMessage.css('backgroundColor', '#fff');

        this.percentTotalCalories();
        // Appends various totals to respective table DOM elements
        $('#calorie-total', this.el).html(Math.round(this.calories));
        $('#calories-consumed-today', this.el).html(Math.round(this.calories));
        $('#protein-total', this.el).html(this.protein.toFixed(1));
        $('#fat-total', this.el).html(this.fat.toFixed(1));
        $('#carbohydrate-total', this.el).html(this.carbs.toFixed(1));
        $('#protein-calories', this.el).html( Math.round(this.proteinCaloriesPercentage) );
        $('#fat-calories', this.el).html( Math.round(this.fatCaloriesPercentage) );
        $('#carbohydrate-calories', this.el).html( Math.round(this.carbCaloriesPercentage) );

        // Specify total calories as being 100% of total intake
        $('#calorie-calories', this.el).html(100);
        return this;
    },

    resetTotals: function(){
        this.calories = 0;
        this.protein = 0;
        this.fat = 0;
        this.carbs = 0;
    },

    getTodaysTotals: function(){

        //Hides this DOM element when today's totals being displayed

        this.numberOfDaysBeingDisplayed.hide();

        // Indicate to user that TOTAL values being displayed
        //this.averageOrTotalsNotification.html('Showing Total Values');
        this.calorieUnit.html('kcal');

        // Hides average calories over a given date range
        this.averageCaloriesContainer.hide();
        this.resetTotals();
        this.percentTotalCalories();
        //Iterate through eaten foods and obtain totals
        _.each(app.dailyTrackedFoods.models, function(food){
            this.calories += food.get('calories');
            this.protein += food.get('protein');
            this.fat  += food.get('fat');
            this.carbs += food.get('carbs');
        }, this);

        // Display date to user
        this.datesBeingDisplayed.html(this.todaysDay + ', ' + this.todaysDate);

        //Render changes
        this.render();

        //Hide 'View Todays Totals' and 'Averages'button

        this.todaysTotalsButton.hide();
        this.toggleTotalsButton.hide();
        //Clear notification of whether averages or totals displayed when only today's totals displayed
        this.averageOrTotalsNotification.empty();
    },

    percentTotalCalories: function(){

        /** Multiply each macronutrient by their cal per gram co-efficients
          * to obtain calories from that macronutrient
          */
        this.carbCalories = this.carbs * 4;
        this.fatCalories = this.fat * 9;
        this.proteinCalories = this.protein * 4;
        this.proteinCaloriesPercentage = 0;
        this.fatCaloriesPercentage = 0;
        this.carbCaloriesPercentage = 0;
        this.totalMacroCalories = this.carbCalories + this.fatCalories + this.proteinCalories;

        // To avoid subsequent zero-division error, catches when this.calories is 0
        if(this.calories !== 0) {
            /** Had to implement a scaling factor as stated total calories for a food did not always match
              * the calorie total drived from analysis of stated macronutrient composition. In fact, the total stated
              * calorie total was always greater than the total calories derived from analysis of the macronutrients
              */
            this.scalingFactor = this.calories/this.totalMacroCalories;
            //create percentage totals for each macronutrient, scaled by calculated factor
            this.carbCaloriesPercentage = this.scalingFactor*(100*this.carbCalories/this.calories);
            this.fatCaloriesPercentage = this.scalingFactor*(100*this.fatCalories/this.calories);
            this.proteinCaloriesPercentage = this.scalingFactor*(100*this.proteinCalories/this.calories);
        }
    },

    /** Create array of dates from dayLog Collection for use in autocomplete */
    getAvailableDates: function(){
        /** Call sort on app.dayLog to ensure dates are in chronological order */
        app.dayLog.sort();

        app.arrayOfAvailableDates = [];
        app.dayLog.each(function(day){
            app.arrayOfAvailableDates.push(day.get('id'));
        });
        /** Need to add today to array of available dates. Since array is chronologically
          * ordered can use 'push' to do this
          */
        app.arrayOfAvailableDates.push(app.getTodaysDateFormatted(app.zeroHour));
    },

    /** Get user selected date range and use it to create an array of relevant day Models */

    pullDatesAndGetArrayOfDayModels: function(){
        var invalidDateArray = [];
        this.startDateInvalid = false;
        /** Check if dates in input box match dates of day Models in Collection */
        this.startDate = $('#drop-down-menu-start', this.el).val();
        this.startDateDayModel = app.collectionOfAvailableDatesIncludingToday.get(this.startDate);
        /** Test if valid date entered into  start date input box */
        if(this.startDateDayModel !== undefined){
            /** Obtains index of the start date */
            this.startIndex = app.collectionOfAvailableDatesIncludingToday.indexOf(this.startDateDayModel);

        } else{
            /** Variable set to true, which will be used to communicate issue with data input to user */
            this.startDateInvalid = true;

            invalidDateArray.push('Start Date');
        }
        this.endDateInvalid = false;
        this.endDate = $('#drop-down-menu-end', this.el).val();
        this.endDateDayModel = app.collectionOfAvailableDatesIncludingToday.get(this.endDate);
        /** Test if valid date entered into end date input box */
        if(this.endDateDayModel !== undefined) {
            /** Obtains index of the end date*/
            this.endIndex = app.collectionOfAvailableDatesIncludingToday.indexOf(this.endDateDayModel);

        } else {
            this.endDateInvalid = true;
            invalidDateArray.push('End Date');
        }
        /** The following code tests to see if the user has entered a start date that is later than the end date. If so, their order is reversed */
        if (this.startIndex > this.endIndex) {
            var temp;
            temp = this.endIndex;
            this.endIndex = this.startIndex;
            this.startIndex = temp;
        }

        /** Tests if need to notify user of issues with invalid input to input boxes */
        if(this.startDateInvalid === true){

            $('#start-date-wrong', this.el).html('! Please select a date above !');

            // app.notifyUserOfInvalidDates('The entries in the following fields are invalid.','Please select the date you require from the autocomplete menu.', invalidDateArray, '#user-message', 'red');

        }

        if(this.endDateInvalid === true){

            $('#end-date-wrong', this.el).html('! Please select a date above !');

            // app.notifyUserOfInvalidDates('The entries in the following fields are invalid.','Please select the date you require from the autocomplete menu.', invalidDateArray, '#user-message', 'red');

        }

        if(this.startDateInvalid === false && this.endDateInvalid === false) {
            /** Obtain array of day Models relevant to user inputted date range */
            app.arrayOfRelevantDates = app.collectionOfAvailableDatesIncludingToday.filter(function(day){
                return app.collectionOfAvailableDatesIncludingToday.indexOf(day) >= this.startIndex && app.collectionOfAvailableDatesIncludingToday.indexOf(day) <= this.endIndex;
            }, this);
            /** Call to function to tally totals and subsequently render them to the user */
            this.getDateRangeTotals();
            // Indicate to user that TOTAL values being displayed
            this.averageOrTotalsNotification.html('Showing Total Values');
            //Display date range to user
            this.datesBeingDisplayed.html(this.startDate + '<br>' + '<span style="font-size:small"> to</span>' + '<br>' +  this.endDate + '<br>');

        }

        // Show other buttons once date range displayed

        this.toggleTotalsButton.show();
        this.todaysTotalsButton.show();
    },

    /** Function that iterates through the app.arrayOfRelevantDates array and obtains totals */

    getDateRangeTotals: function(){
        /** Calls to these two functions to clear out previous totals and obtain values for calculation of percentage calories, respectively*/
        this.resetTotals();
        this.percentTotalCalories();
        app.arrayOfRelevantDates.forEach(function(day){
            this.calories += day.get('calorieTotal');
            this.protein += day.get('proteinTotal');
            this.fat  += day.get('fatTotal');
            this.carbs += day.get('carbTotal');
        }, this);

        //Variables that store values for totalled calories and macronutrients
        this.storedCalories = this.calories;
        this.storedProtein = this.protein;
        this.storedFat = this.fat;
        this.storedCarbs = this.carbs;
        this.numberOfDays = this.endIndex - this.startIndex + 1;
        this.numberOfDaysBeingDisplayed.show();
        if(this.numberOfDays >1) {
            this.numberOfDaysBeingDisplayed.html("-- " + this.numberOfDays + ' days --');
        } else {
            this.numberOfDaysBeingDisplayed.html("-- " + this.numberOfDays + ' day --');
        }


        this.render();
    },

    /** Function that calculates average calories consumed over the user inputted date range. Default display is today's calories */
    getAverageCalories: function(){
        // Resets the values of the various variables each time to
        // avoid repeated divisions of the calorie and macronutrient totals.
        // .stored variables are updated each time the user selects a new date range
        this.calories = this.storedCalories;
        this.protein = this.storedProtein;
        this.fat = this.storedFat;
        this.carbs = this.storedCarbs;
        this.averageCalories = 0;
        /** Number of days in range calculated from index positions of day Models in parent Collection */
        this.numberOfDays = this.endIndex - this.startIndex + 1;

        /** Only calculates averages if valid input in BOTH date range input boxes */
        if(this.startDateInvalid !== true && this.endDateInvalid !== true) {
            this.averageCalories = Math.ceil(this.calories/this.numberOfDays);
            //toFixed fucntion returns a String, therefore needs
            //to be passed through parseFloat function to return a float
            // this.averageCalories = (this.calories/this.numberOfDays).toFixed(1);
            // this.averageCalories = parseFloat(this.averageCalories);
            this.averageProtein = (this.protein/this.numberOfDays).toFixed(1);
            this.averageProtein = parseFloat(this.averageProtein);
            this.averageFat = (this.fat/this.numberOfDays).toFixed(1);
            this.averageFat = parseFloat(this.averageFat);
            this.averageCarbs = (this.carbs/this.numberOfDays).toFixed(1);
            this.averageCarbs = parseFloat(this.averageCarbs);
            this.averageCaloriesValue.text(this.averageCalories + ' calories');
            /** Display average calories to the user, if appropriate */
            this.averageCaloriesContainer.show();
        } else {
            /** Hides this element from the user in the event of invalid input */
            this.averageCaloriesContainer.hide();
        }
    },

    /** Function that keeps data synced between dayLog Collection and collectionOfAvailableDatesIncludingToday */

    updateModels: function(){

        /** Use toJSON() to pull data from app.dayLog for resetting of Collection.
          * Using .models resulted in the day Model's Collection being an array - wrong structure!
          */

        app.collectionOfAvailableDatesIncludingToday.reset(app.dayLog.toJSON());

        /** Creates new day Model and adds to Collection of available dates */
        var today = new app.Day({

            id: app.getTodaysDateFormatted(app.zeroHour),

            day: app.getDay(app.zeroHour),

            /** Clones today's tracked foods */

            collection: new app.FoodCollection(app.dailyTrackedFoods.toJSON())
        });
        /** Call to Model method to generate totals of marconutrients and calorie total */
        today.getTotals();
        app.collectionOfAvailableDatesIncludingToday.add(today);
    },

    buildDropDownMenuOptions: function(){
        /**
          * For some reason, user must click on select DOM element three times
          * for correct constructon of drop-down menu. To avoid rebuilding list each time
          * user clicks on element, and for menu to have correct functionality, limited calls to
          * this function after three clicks by user using counter, this.buildDropDownMenuCounter
          */
        if(this.buildDropDownMenuCounter < 2){
            this.dropDownMenuStart = $('#drop-down-menu-start');
            this.dropDownMenuEnd = $('#drop-down-menu-end');
            this.dropDownMenuStart.empty();
            this.dropDownMenuEnd.empty();
            this.fragmentStart = document.createDocumentFragment();
            this.fragmentEnd = document.createDocumentFragment();
            //Declare variables outside for loop for storing TWO, seperate option elements
            //to be appended to the different select elements
            var optStart;
            var optEnd;
            app.arrayOfAvailableDates.forEach(function(date) {
                optStart = document.createElement('option');
                optStart.innerHTML = date;
                optStart.value = date;
                optEnd = document.createElement('option');
                optEnd.innerHTML = date;
                optEnd.value = date;
                // Need two different option elements, to be
                // appended seperately to each select element for desired outcome
                this.fragmentStart.appendChild(optStart);
                this.fragmentEnd.appendChild(optEnd);

            }, this);
            this.dropDownMenuStart.append(this.fragmentStart);
            this.dropDownMenuEnd.append(this.fragmentEnd);
        }
        this.buildDropDownMenuCounter++;
    },

    dateRangeConfirmation: function(){
        var confirmationTemplate = _.template($("#date-range-confirmation").html());
        this.userMessage.html(confirmationTemplate);
        this.userMessage.css('background-color', '#3c3');
        // Resets counter so that select element can be rebuilt
        this.buildDropDownMenuCounter = 0;
    },

    //Clears out userMessage DOM element when user cancels addition of food item
    emptyMessageDiv: function(){
        this.userMessage.empty();
        this.userMessage.removeClass('styled');
        this.userMessage.css('background-color', 'white');

    },

    toggleTotalsAndAverages: function(){
        // Since first click requests average values, first value
        // for displayed date range is raw totals

        if(this.toggleCounter%2 === 0){
            this.getAverageCalories();
            this.calories = this.averageCalories;
            this.protein = this.averageProtein;
            this.fat = this.averageFat;
            this.carbs = this.averageCarbs;
            this.toggleTotalsButton.html('View Totals');
            this.calorieUnit.html('kcal/day');
            this.averageOrTotalsNotification.html('Showing Average Values');

        } else {
            this.calories = this.storedCalories;
            this.protein = this.storedProtein;
            this.fat = this.storedFat;
            this.carbs = this.storedCarbs;
            this.toggleTotalsButton.html('View Averages');
            this.calorieUnit.html('kcal');
            this.averageOrTotalsNotification.html('Showing Total Values');
        }
        this.toggleCounter++;
        this.render();
    }
});