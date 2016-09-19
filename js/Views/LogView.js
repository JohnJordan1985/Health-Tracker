
// /js/Views/LogView.js

/**
  * @desc File that creates tab for the display of the 'Daily Log' tab
  * @author John Jordan johnjordan1985@gmail.com
  * @date 12 April 2016
  */

var app = app || {};



app.daySelectedFromLog = new app.Day();

if ( localStorage.dayLog ){

	  //Copies data from localStorage of past day's foods

    var input = JSON.parse(localStorage.dayLog);

    var clone = new app.Days(input);

    //Overwrite app.dayLog with saved data from localStorage
    app.dayLog = clone;



} else {

	/** Creates a new Day Model in the dayLog collection with todays date as an id, and
	  * todays tracked foods as its Collection
      */

    app.dayLog = new app.Days();

    //Adds two past days for testing of editing functionality

    var dayMinusOne = new app.Day({

            //add id attribute to avoid duplicate days
            id: app.getTodaysDateFormatted(app.getIncrementedDate(-1)),

            day: app.getDay(app.getIncrementedDate(-1)),

            collection: new app.FoodCollection()
        });

    app.dayLog.add(dayMinusOne);

    var dayMinusTwo = new app.Day({

            //add id attribute to avoid duplicate days
            id: app.getTodaysDateFormatted(app.getIncrementedDate(-2)),

            day: app.getDay(app.getIncrementedDate(-2)),

            collection: new app.FoodCollection()
        });
    app.dayLog.add(dayMinusTwo);
    //console.log(app.dayLog);

}

if (localStorage.zeroHour) {

	app.zeroHour = new Date((localStorage.getItem('zeroHour')));

} else {

	app.zeroHour = app.setToZeroHours(new Date());

	localStorage.zeroHour = app.zeroHour;
}

//Builds array of years for use in autocomplete menu
var currentDate = new Date();
app.year = currentDate.getFullYear();
app.integerOfCurrentYear = parseInt(String(currentDate.getFullYear()));
app.arrayOfYears = [];
for (var i = -1; i <= 1; i++){
  app.arrayOfYears.push(String(app.integerOfCurrentYear + i));
}

app.daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];


// Array for storing of days in calender, as strings, for use in autocomplete menus

app.daysInCalender =[];

/**
  * Collection that holds the autocomplete array for the given input DOM elements
  */
app.collectionOfElementsAndArrays = {'year-input': app.arrayOfYears, 'month-input': app.monthNames};


app.LogView = Backbone.View.extend({
	tagName: 'section',

	events: {

		'click li': 'unselectOtherDays',
		'click button#invert': 'invertOrder',
    'click button#add-day': 'addDay',
    // 'click button#delete-day': 'deleteDay',
    // 'click button#no-delete': 'cancelDeletion',
    'click button#cancel-addition': 'cancelDeletion',
    // 'click button#yes-delete': 'confirmDeletion',
    'click button#yes-permanent-delete': 'offerPermanentDelete',
    'click button#no-confirm-permanent-delete': 'cancelPermanentDeletion',
    'click button#yes-confirm-permanent-delete': 'confirmPermanentDeletion',
    'keyup input': 'getUserInput',
    'click input': 'getUserInput'
	},

	initialize: function(){
		$(this.el).append('<h1 id="user-message"></h1>');

    //cache reference to user-message DOM element

    this.userMessage = $('#user-message', this.el);
    //This is the default message that is displayed to the user if the global app.globalUserMessage is empty

    this.defaultUserMessage = "<p>This is the log section. If you would like to edit a day, please select it from this list.</p>";
		//Logic that tests if to see if there are any saved messages for the user prior to LogView been reset
    if (app.globalUserMessage === ""){
      this.userMessage.html(this.defaultUserMessage);
      this.userMessage.css("background-color", "white");

    } else {
      this.userMessage.html(app.globalUserMessage);
      this.userMessage.css("background-color", "#f72");
      // Empties app.globalUserMessage so that message to user is reset
      app.globalUserMessage ="";

    }
    $(this.el).append('<button type="button" id="invert"><div style="font-weight: bold">Newest First</div></button>');
    $(this.el).append('<button class="add-button" type="button" id="add-day"> Add NEW Day </button>');


    // $(this.el).append('<button class="delete-button" type="button" id="delete-day">Delete</button>');
		$(this.el).append('<hr><ul id="day-log"></ul>');

    //Appends a div that will contain the 'Clear History' button
    $(this.el).append('<hr><br><div id="clear-history-container"><br><p>Would you like to <b>permanently delete</b> your entire food log?</p><button class="add-button" type="button" id="yes-permanent-delete"> Yes </button></div>');
    // Create reference to the container containing the clear entire history function
    this.clearHistoryContainer = $('#clear-history-container', this.el);

    // Create template of Permanent Deletion Confirmation
    this.confirmPermanentDeletionContainer = _.template($('#permanent-deletion-confirmation').html());
		_.bindAll(this, 'render', 'saveLog', 'createDummyDays', 'resetClock', 'switchOver', 'unselectOtherDays', 'invertOrder', 'deleteDay', 'cancelDeletion', 'confirmDeletion', 'addDay', 'getUserInput', 'alertUserOfBadInput');

		this.listenTo(app.dayLog, 'add remove reset', this.render);
		this.listenTo(app.dayLog, 'change add remove', this.saveLog);

    //Holders for use in deleteDay function
    this.actualDayToDelete = "";

    this.testForDayToDelete = false;

		//Cache reference to unordered list of past days
		this.list = $('#day-log', this.el);


		//Check calender time and amend dayLog as needed
		this.switchOver();

		/** Following code clears the Log View of previously saved data
		  * regarding the selection and check status of a user selected Day Model from the dayLog Collection
      */

		app.dayLog.each(function(day){
			if(day.get('checked') === true) {
				day.set({'checked': false});
			}
		});
		app.dateSelectedFromLog = '';
		app.daySelectedFromLog = '';
    //Sort Collection of days in chronological order
    app.dayLog.sort();

    //Templates for various confirmation screens for addition/deletion of days

    this.confirmationTemplate = _.template($("#deletion-confirmation").html());

		this.additionScreen = _.template($("#addition-confirmation").html());
    this.invertButton = $("#invert", this.el);
    this.counter = 0;

	},

	render: function(){

		this.list.empty();
    var l = app.dayLog.length;

    console.log(app.dayLog.length);

    //If no past days recorded, inform user

    if (l === 0) {

      this.list.text("The list is empty.\nYou have not recorded any past day's food consumption.");

    } else {
        app.dayLog.each(function(model){

        var pastDay = new app.DayListView({

          model: model,

          foodCollection: new app.FoodCollection(model.get('collection')),
        });

        this.list.append( pastDay.render().el);

      }, this);
    }

		return this;
	},

	/**
    * Helper function that creates empty days BETWEEN the users previous tracked day and
	  * present calender day
    */

	createDummyDays: function(differenceInDays){
		/** Variables declared outside 'for' loop for creation of id of each day Collection as
		  * a formatted date e.g. '21 March 2016'
          */

		var dayId;
		var formattedDayId;

		/**
      * For every day that BETWEEN present calender day and last tracked day, a new Day Model is
      * added to the Days Collection, with an empty FoodList collection.
      */

    for (var i = 1; i <= differenceInDays; i++){

        	// Create incremented date in milliseconds using app.zeroHour as the reference date
        	dayId = app.zeroHour;
            /** Had to compensate as app.zeroHour was been incremented each time through 'for' loop for reasons unknown */
        	dayId.setDate(dayId.getDate() + 1);

        	// Create formatted date using helper function to create id for new day Collection

        	formattedDayId = app.getTodaysDateFormatted(dayId);

          var day = new app.Day({
            // Add id attribute as formatted date
            id: formattedDayId,

            // Using helper function, obtain weekday of dayId for display

            day: app.getDay(dayId),

            collection: new app.FoodCollection()
          });

            /**
              * Hack designed to establish if Day model with a given ID already exists
              * in Collection. Returns an array containing elements with the searched ID.
              * If length of array is zero, then day Model doesn't exist in Collection,
              * and the Day model can be added.
              */

            var b = app.dayLog.where({id: day.get('id')});

            //If test to prevent addition of duplicate Day Models
            if(b.length > 0){
            	// do nothing
            } else{
            	app.dayLog.add(day);
            }
        }
	},

    /**
      * Function that determines if a new calender day has begun and automatically updates the application's data
      * when the user clicks into the 'Daily Log' tab.
      */

	switchOver: function(){

        //variable used to determine current time
        var rightNow = new Date();

        /**
          * This is the line to edit if you want to use app.getIncrementedDate to test the switchOver function.
          * Replace 'app.zeroHour' with the call to app.getIncrementedDate, with the desired number of days in the
          * future passed as an integer to the function
          */
        app.testTime = app.zeroHour;


        /** Determine number of hours between external time reference stored in local storage
          * and present time
          */
        var diff = app.diffHours(rightNow, app.testTime);

        //resets dailyTrackedFoods Collection at stroke of midnight, as new calender day has begun

        if ( diff >= 24 ) {

        	this.list.empty();

        	/** create a clone of app.dailyTrackedFoods, so that previous tracked day's food Collection
        	  * doesn't track changes from app.dailyTrackedFoods, which is the Collection that is
        	  * being continually updated by the user
              */

        	var lastTrackedDay = new app.Day({

                //add id attribute to avoid duplicate days
                id: app.getTodaysDateFormatted(app.zeroHour),

                day: app.getDay(app.zeroHour),

                // Saves a deep clone of the app.dailyTrackedFoods Collection to the Day model

                collection: new app.FoodCollection(app.dailyTrackedFoods.toJSON())
            });

            /**
              * var a stores the result of .where method called on app.dayLog, which is an empty array if
              * no Day Model with a given id exists in the Collection.
              */
            var a = app.dayLog.where({id: lastTrackedDay.get('id')});

            // If array a is non-empty that means a day with the given id already exists in the Collection
            if(a.length > 0){
            	// do nothing as day with given id already exists in the Collection
            } else{
            	app.dayLog.add(lastTrackedDay);
            }

            /**  Calculate number of days in difference and create new Day model for each day
            since last change. */

            var differenceInDays = app.diffDays(rightNow, app.testTime);

            /**
              * app.diffDays rounds up difference in days, using ceil(), with effect of including
              * both days at end of a date interval. Therefore, to find the days BETWEEN two dates, need
              * to subtract '2' from differenceInDays
              */

            differenceInDays = differenceInDays - 2;

            /**
              * Create empty days between current calender day and last tracked day, if any.
              * Note: The current calender day is not displayed in the Log View, only past days
              */
            if(differenceInDays >= 0) {
            	this.createDummyDays(differenceInDays);
            }

            // Reset app.dailyTrackedFoods for use during new calender day, a well as localStorage
            app.dailyTrackedFoods.reset();
            localStorage.removeItem('foods');

            /** Reset external localStorage and internal application time */
            this.resetClock();

            /** Sorts app.dayLog based on timeStamp attribute */
            app.dayLog.sort();
        } else {

        }
	},

	//Function to update 'zeroHour' variable, both within app and in localStorage
	resetClock: function(){

		app.zeroHour = app.setToZeroHours(new Date());

		localStorage.zeroHour = app.zeroHour;
	},

	saveLog: function(){

    //Convert Collection to JSON string for passage to localStorage
    var d = JSON.stringify(app.dayLog);
    localStorage.dayLog = d;

    /** Due to issue with lastTrackedDay not displaying food values upon initial creation (it
   	  * required a page refresh before it displayed its calorie etc values) I wrote over
		  * app.dayLog with the newly created localStorage data. I don't understand why, but
		  * this code gives me the functionality I require, i.e. food analysis values
		  * displayed upon inital render
      */
    var input = JSON.parse(localStorage.dayLog);
  	var clone = new app.Days(input);
  	//Overwrite app.dayLog with saved data from localStorage
  	app.dayLog = clone;
    //console.log(localStorage.dayLog.models);
    //console.log(app.dayLog.models);
	},

	//Unchecks ALL other days
	unselectOtherDays: function(){
    //Once user clicks on a Day View from the list, the user-message element is styled
    this.userMessage.addClass('styled');
		//A call to render to update the list
		this.render();
	},

	invertOrder: function(){
		/** A simple use of models.reverse achieved desired functionalitu, leaving out
		  * use of .sort method that pernamently sorted dayLog Collection
      */
		app.dayLog.models.reverse();
    if (this.counter%2 === 0){
      this.invertButton.html('<div style="font-weight: bold">Oldest First</div>');
    } else {
      this.invertButton.html('<div style="font-weight: bold">Newest First</div>');
    }
    this.counter++;
		this.render();
	},

  deleteDay: function(){

    app.dayLog.each(function(day){
      if(day.get('checked') === true) {
        //Sets holder variable to Day model that is to be deleted from Collection
        this.testForDayToDelete = true;
        this.actualDayToDelete = day;
        //open confirmation window
        this.userMessage.html(this.confirmationTemplate(day.attributes));
        //Add appropriate styling to DOM element
        this.userMessage.addClass('styled');
        this.userMessage.css("background-color", "#3c3");
      }
    }, this);
    if(this.testForDayToDelete === false){
      app.notifyUser("You haven't selected a day to delete!" +'<br>' + "If you want to delete a day, please select it from the list, then press the 'Delete' button.", [], '#user-message', 'red');
      this.userMessage.addClass('styled');
    }
    //reset holder variable
    this.testForDayToDelete = false;
  },

  //Function that clears out information from user-message DOM element

  cancelDeletion: function(){
    this.userMessage.empty();
    this.userMessage.removeClass('styled');
    this.userMessage.css("background-color", "white");
    //Redisplays add-day button
    $('#add-day', this.el).show();
  },
  //Function that removes the checked Day Model from the app.dayLog Collection

  confirmDeletion: function(){

    app.dayLog.remove(this.actualDayToDelete);

    app.notifyUser("You have just deleted the following day from your records:" +'<br>' + this.actualDayToDelete.get('day') + ', ' + this.actualDayToDelete.get('id') , [], '#user-message', 'red');

    this.userMessage.addClass('styled');
    //Explicit call to this.saveLog as listener not working
    this.saveLog();
  },

  // Function that grabs user input from text field and calls helper function

  getUserInput: function(e){

    var self = this;

    this.jQueryElement = $(e.currentTarget);
    //console.log(this.jQueryElement.val());
    this.userInput = $(e.currentTarget).val();
    //console.log(app.collectionOfElementsAndArrays[e.currentTarget.id]);
    this.autocompleteArray = app.collectionOfElementsAndArrays[e.currentTarget.id];

    if(this.autocompleteArray.indexOf(this.userInput) != -1){
      //Set values of various data inputs to 'Valid' if okay
      //console.log(e.currentTarget.id);
      //Code checks if all data fields entered by user are valid

      if(e.currentTarget.id="year-input"){
        this.yearInputValid = true;
        //console.log('year input is: ' + this.yearInputValid);
      }
      if(e.currentTarget.id="month-input"){
        this.monthInputValid = true;
      }

      if(e.currentTarget.id="day-input"){
        this.dayInputValid = true;
      }

      this.jQueryElement.css('background-color', 'white');
    } else {
      this.jQueryElement.css('background-color', '#f22');
    }

    if(this.yearInputValid=== true && this.monthInputValid===true && this.dayInputValid===true) {
      //console.log('all good');

      // If all data inputs valid, then confirmation of addition button appears
      this.addDayButtonConfirmation.show();

    }

  },

  alertUserOfBadInput: function(){
     // Tests if user input is in array using indexOf method, which returns -1 if item not in an array

    if(this.autocompleteArray.indexOf(this.userInput) != -1){
      //console.log(this.userInput);
      this.jQueryElement.css('background-color', 'white');
    } else {
      this.jQueryElement.css('background-color', '#f22');
    }
  },

  // Offer user option to confirm the permanent deletion of their historic food log

  offerPermanentDelete: function(){

    this.clearHistoryContainer.html(this.confirmPermanentDeletionContainer);
    this.clearHistoryContainer.css('background-color', '#3c3');
  },

  // Function that responds to users decline of offer of permanent deletion of daily log

  cancelPermanentDeletion: function(){
    // Reverts content of container to original content.
    this.clearHistoryContainer.html('<div id="clear-history-container"><br><p>Would you like to <b>permanently delete</b> your entire food log? </p><br><button class="add-button" type="button" id="yes-permanent-delete"> Yes </button></div>');
    this.clearHistoryContainer.css('background-color', 'white');
  },

  // Function that executes users request to permanently delete dayLog

  confirmPermanentDeletion: function(){
    //Clears localStorage of dayLog attribute.
    // Wanted to keep zeroHour attribute for calculation purposes
    // Also ToDo app uses localStorage so important not to clear out entirely.

    localStorage.removeItem('dayLog');

    // Empties app.dayLog;
    app.dayLog.reset();

    // Notify user that dayLog has been wiped

    app.notifyUser('<h1 style="">You have just deleted your entire record of food intake!</h1>' + '<p style="color: white; font-size:small"> While the digital record has been wiped clean, the record that sits around your waist will not be so easy to remove.</p>', [], '#user-message', 'green');

    //Call this function to restore div to original state

    this.cancelPermanentDeletion();

    // Direct call to render function

    this.render();

    },

  // Function that adds a user-specified day Model to Collection

  addDay: function(){

    app.addWindow = new app.AddDayView();
    app.addWindow.render().el;
    //Hide 'add-day' once 'add-day confirmation window is open'
    $('#add-day', this.el).hide();

    /** Following 'for' loop sets value of options elements of select DOM element
      * equal to value of incremented year
      */

      //Removed this 'for' loop in favour of dynamically creating year drop-down menu
    // $("select#year-dropdown option").each(function(index, model){
    //   model.value = app.arrayOfYears[index];
    //   model.innerHTML = app.arrayOfYears[index];
    // });

    this.fragmentStart = document.createDocumentFragment();

    app.arrayOfYears.forEach(function(index, model){
      var optStart = document.createElement('option');
      optStart.innerHTML = index;
      optStart.value = index;
      this.fragmentStart.appendChild(optStart);
    }, this);

    this.yearDropDown = $("#year-dropdown", this.el);

    this.yearDropDown.append(this.fragmentStart);


    // Prepends a message to user to select a year
    this.yearDropDown.prepend('<option class="default-option" style="text-algin:center" value="" selected disabled>Select a year</option>');

    this.fragmentStart = document.createDocumentFragment();

    app.monthNames.forEach(function(index, model){
      var optStart = document.createElement('option');
      optStart.innerHTML = index;
      optStart.value = index;
      this.fragmentStart.appendChild(optStart);
    }, this);

    this.monthDropDown = $("#month-dropdown");

    this.monthDropDown.append(this.fragmentStart);

    // Prepends a message to user to select a year
    this.monthDropDown.prepend('<option class="default-option" style="text-algin:center" value="" selected disabled>Select a month</option>');


    this.fragmentStart = document.createDocumentFragment();
    //console.log(app.daysInCalender);

    app.daysInCalender = [];
    for(var i = 1; i<32; i++){
      app.daysInCalender.push(i);
    }

    app.daysInCalender.forEach(function(index, model){
      var optStart = document.createElement('option');
      optStart.innerHTML = index;
      optStart.value = index;
      this.fragmentStart.appendChild(optStart);
    }, this);
    ////console.log(app.monthNames[userInputForMonth]);
    this.dayDropDown = $("#day-dropdown");
    this.dayDropDown.append(this.fragmentStart);
    this.dayDropDown.prepend('<option class="default-option" style="text-algin:center" value="" selected disabled>Select a day</option>');


    // this.addDayButtonConfirmation = $("#confirm-addition", this.el);
    // // Hides 'Add Day' button until all data entry fields have valid input
    // this.addDayButtonConfirmation.hide();

    //this.userMessage.html(this.additionScreen());

    $("#month-input", this.el).autocomplete({
      source: app.monthNames
    });
    $("#year-input", this.el).autocomplete({
      source: app.arrayOfYears
    });
    //console.log(app.arrayOfYears);
    //console.log($("#year-input", this.el));
    //Add appropriate styling to DOM element
    this.userMessage.addClass('styled');
    this.userMessage.css("background-color", "#3c3");
  }

});