
// /js/Views/AddDayView.js

/**
  * @desc File that creates View for the display of the 'Add Day' function
  * of the LogView tab
  * @author John Jordan
  * @date 27/04/2016
  */
var app = app || {};

/** Following variable used to detect if mobile device being used to display app
  * as typical 'click' event was not being registered on mobile device
  * CSS code sets its display to 'none', then
  *
  */

var isMobile=false;

app.AddDayView = Backbone.View.extend({
	el: '#user-message',

	events:{
		'click select#year-dropdown': 'checkDataInput',
		'click select#month-dropdown': 'checkDataInput',
		'click select#day-dropdown': 'helperClearDayDropDown',
		'click button#confirm-addition': 'confirmAdditionOfNewDay',
		'touchend select#year-dropdown': 'checkDataInput',
		'touchend select#month-dropdown': 'checkDataInput',
		'touchend select#day-dropdown': 'helperClearDayDropDown'
	},

	template: _.template($("#addition-confirmation").html()),

	initialize: function(){
		$(this.el).prepend("<span id='#mobile-screen'></span>");
		//console.log('New view created');
		_.bindAll(this, 'render', 'checkDataInput', 'getMaximumDayOfMonth', 'helperClearDayDropDown', 'confirmAdditionOfNewDay', 'validateYearAndMonthInput');
		//Variables to hold 'true' if their matched drop-down menus have valid inputs
		this.yearInputValid = false;
		this.monthInputValid = false;
		this.dayInputValid = false;

		// //THe following interval timers are a hack to ensure these functions are called on mobile devices
		// //as issues arose during development on mobile devices

		// setInterval(this.validateYearAndMonthInput, 1000);
		// setInterval(this.helperClearDayDropDown, 1000);

	},

	render: function(){
		$(this.el).html(this.template());
		this.addDayButtonConfirmation = $("#confirm-addition", this.el);
	    // Hides 'Add Day' button until all data entry fields have valid input
	    this.addDayButtonConfirmation.hide();
		return this;
	},

	checkDataInput: function(){
		this.arrayOfCalenderInfo = [app.arrayOfYears, app.monthNames, app.daysInCalender];
		this.userYearInput = '';
		this.arrayOfIds = ["#year-dropdown", "#month-dropdown", "#day-dropdown"];
		for(var i = 0; i < 3; i++){

			this.DOMelement = $(this.arrayOfIds[i]);
			this.userInputValue = this.DOMelement.val();

			// tests if user input is within respective array

			if(this.arrayOfCalenderInfo[i].indexOf(this.userInputValue) != -1){
				//console.log('user ipnut it');
				//console.log(this.userInputValue);

			  this.DOMelement.css('background-color', 'white');

			  if(this.arrayOfIds[i] === "#year-dropdown"){
					this.userYearInput = this.userInputValue;
					//console.log('In year');
					this.yearInputValid = true;
			    }


		      // Passes valid calender month input into other function
		      if(this.arrayOfIds[i] === "#month-dropdown"){
		      		this.userMonthInput = this.userInputValue;
					this.getMaximumDayOfMonth(this.userInputValue);
					this.monthInputValid = true;
					//console.log('In month');
				}

			// This code never entered as call to getMaximumDayOfMonth reset dayDrop-down menu
			// so that pulled input is always invalid

			  // Sets this.dayInputValid as 'true' when valid day input entered by user

			 //  if(this.arrayOfIds[i] === "#day-dropdown"){
				// 	this.dayInputValid = true;
				// 	//console.log('In test');
				// 	//console.log(this.userInputValue);
				// 	this.DOMelement.css('background-color', 'white');
				// }
		    } else {

		      //Hide add button confirmation

		      this.addDayButtonConfirmation.hide();

		      this.DOMelement.css('background-color', '#f22');
		      //Since input is invalid, need to inform user and update holder variables
		      if(this.arrayOfIds[i] === "#year-dropdown"){
					this.yearInputValid = false;
				}
		      if(this.arrayOfIds[i] === "#month-dropdown"){
					this.monthInputValid = false;
				}
		      if(this.arrayOfIds[i] === "#day-dropdown"){

					this.dayInputValid = false;

					//Pass in string representation of day integer, or NaN if no day selected
					//this.helperClearDayDropDown(this.userInputValue);
				}
		    }

		    // In order to interrupt the setInterval call to this.checkDataInput, which
		    //overrides input in day-dropdown menu, following code is needed.

		    if(this.yearInputValid === true && this.monthInputValid === true){
		    	//clearInterval(this.YearMonthCheck);
		    	console.log('timer cleared');
		    }
		    //console.log(this.yearInputValid, this.monthInputValid, this.dayInputValid);
		}
	},

	// Function that creates an array of days as strings, limited by calender month maximum

	getMaximumDayOfMonth: function(userInputForMonth){
		//find number of days in calender month

		this.dayDropDown = $("#day-dropdown");

		// //console.log(app.monthNames);
		// //console.log(userInputForMonth);
		// //console.log(app.monthNames.indexOf(userInputForMonth));
		var maxDaysIndex = app.monthNames.indexOf(userInputForMonth);
		// //console.log(maxDaysIndex);
		//Tests if current year is a leap year and alters app.daysInMonths array accordingly

		if( (this.userYearInput%4 === 0 && this.userYearInput%100 !== 0) || this.userYearInput%400 === 0) {
		  app.daysInMonths[1] = 29;
		} else {
		  app.daysInMonths[1] = 28;
		}
		//Build array of days for later use
		app.daysInCalender = [];
		//Holder variable for use in 'for' loop
		var a;
		//document fragment
		this.fragmentStart = document.createDocumentFragment();
		for(var i = 1; i <= app.daysInMonths[maxDaysIndex]; i++){
		  if(i<10) {
		    a = '0' + String(i);

		    //Removed these lines to reduce duplication
		    // app.daysInCalender.push(a);

		  } else {
		  	a = String(i);
		    // app.daysInCalender.push(String(i));
		  }

		  app.daysInCalender.push(a);
		  //Creates day options elements for select element
		  var optStart = document.createElement('option');
      	  optStart.innerHTML = a;
      	  optStart.value = a;
      	  this.fragmentStart.appendChild(optStart);
		}

		//Clears out options from day drop-down menu and updates
		//day option based on user selected year and month

		this.dayDropDown.empty();

    	this.dayDropDown.append(this.fragmentStart);
    	//Prepend user message option after emptying select element
    	this.dayDropDown.prepend('<option class="default-option" style="text-algin:center" value="" selected disabled>Select a day</option>');
    	//After resetting drop down menu for day, set variable to false
  //   	this.dayInputValid = false;
		// $("#day-input", this.el).autocomplete({
	 //      source: app.daysInCalender
	 //    });
	},

	// Due to structure of code for checkDataInput and getMaximumDayOfMonth,
	// Day dropdown select element was not been updated to reflect valid input
	// This helper function specifically checks this element once user selects a
	// day

	helperClearDayDropDown: function(){

		//Validate other year and date inputs once user clicks on day drop-down
		//Again, this is part of the process to achieve a smooth user experience on
		//mobile devices

		//this.validateYearAndMonthInput();

		this.dayDropDown = $("#day-dropdown");
		this.userDayInput = this.dayDropDown.val();
		this.parsedUserDayInput = String(parseInt(this.userDayInput));

		if(this.parsedUserDayInput === 'NaN' ){
			//console.log('helper');
			this.dayDropDown.css('background-color', '#f22');
			this.dayInputValid = false;
			this.addDayButtonConfirmation.hide();
		} else {
			//console.log('else');
			this.dayDropDown.css('background-color', 'white');
			this.dayInputValid = true;
		}
		//If all three date entry fields valid, 'Add Day' button is shown

	    if(this.yearInputValid && this.monthInputValid && this.dayInputValid){
	      this.addDayButtonConfirmation.show();
	    }
	},

	confirmAdditionOfNewDay: function(){

		//Hack designed to avoid issues I had with rejection of valid day additions due to multiple calls
		//to this function, for reasons unknown.
		//Clicking on Log tab restored correct behaviour, but lost user messages
		//By using setTimeout, gives user chance to see messages before reset

		//**Edit** 11 Sept 2016 Used app.globalUserMessage variable to store any relevant messages to user
		//Init function of LogView then displays as appropriate after call to .click()

		// setTimeout(function(){

		// $('#log').click();

		// },1000);

		var newid = this.userDayInput + ' ' + this.userMonthInput + ' ' + this.userYearInput;

		var test = app.dayLog.get({
			id: newid
		});



		var d = new Date(newid);
		var n = d.getDay();

		var day = new app.Day({
            // Add id attribute as formatted date
            id: newid,

            // Using helper function, obtain weekday of dayId for display

            day: app.dayNames[n],

            collection: new app.FoodCollection()
        });

        // Backbone Collection automatically prevents addition of Models with same id to Collection
        //Need to notify user when this occurs

        //Returns array with sole element if model with newid already exists in Collection

        var b = app.dayLog.where({'id': newid});
        // console.log('b:');
        // console.log( b);
        // console.log('app.dayLog');
        // console.log(app.dayLog);

        if (b.length >= 1){

        	$(this.el).css('background-color', '#f22');
        	$(this.el).html("<h1>You tried to add the following date to the log:</h1>" + newid + "<br>" + "<p>This day already exists in your log. If you would like to edit it, please select it from the day log below.</p>");
        	app.globalUserMessage = "<h1>You tried to add the following date to the log:</h1>" + newid + "<br>" + "<p>This day already exists in your log. If you would like to edit it, please select it from the day log below.</p>";

        } else{

        	//Need to explicitly prevent addition of today, or any future dates.
	        var today = new Date(app.getTodaysDateFormatted(app.zeroHour));
	        // //console.log(today);
	        var dateOfNewId = new Date(newid);
	        if(dateOfNewId >= today){
	        	$(this.el).css('background-color', '#f22');
	        	if(dateOfNewId === today){
	        		$(this.el).html("<h1>You tried to add the following date to the log:</h1>" + newid + "<br>" + "<p>You cannot add today's date to the log of past days. Today's foods will be automatically saved to the log at midnight.</p>");
	        		// Set global variable value to user message
	        		app.globalUserMessage = "<h1>You tried to add the following date to the log:</h1>" + newid + "<br>" + "<p>You cannot add today's date to the log of past days. Today's foods will be automatically saved to the log at midnight.</p>";
	        	} else {
	        		$(this.el).html("<h1>You tried to add the following date to the log:</h1>" + newid + "<br>" + "<p>You cannot add future dates to the log of past days. Each calender day will be automatically saved to the log at midnight.</p>");
	        		app.globalUserMessage = "<h1>You tried to add the following date to the log:</h1>" + newid + "<br>" + "<p>You cannot add future dates to the log of past days. Each calender day will be automatically saved to the log at midnight.</p>";

	        	}
	        	//console.log('Date is invalid');
	        	//console.log(dateOfNewId, today);
	        } else if(dateOfNewId < today && b.length === 0){
	        	$(this.el).css('background-color', '#3c3');
	        	app.dayLog.add(day);
	        	$(this.el).html('<h1>You just added the following day to the log of past days: <h1>' +  newid);
	        }
        }


        //Redisplays add-day button
    	$('#add-day').show();

    	// Resets LOgView to avoid issues described at start of function definition

    	$('#log').click();

	},

	//The purpose of this code, which reuses code from 'checkdateInput', is to avoid the automatic editing
	// of the day drop-down menu that complicates timed validation of year and month drop down menus

	validateYearAndMonthInput: function(){
		this.arrayOfCalenderInfo = [app.arrayOfYears, app.monthNames];
		this.userYearInput = '';
		this.arrayOfIds = ["#year-dropdown", "#month-dropdown"];
		for(var i = 0; i < 2; i++){

			this.DOMelement = $(this.arrayOfIds[i]);
			this.userInputValue = this.DOMelement.val();

			// tests if user input is within respective array

			if(this.arrayOfCalenderInfo[i].indexOf(this.userInputValue) != -1){
				//console.log('user ipnut it');
				//console.log(this.userInputValue);

			  this.DOMelement.css('background-color', 'white');

			  if(this.arrayOfIds[i] === "#year-dropdown"){

					//console.log('In year');
					this.yearInputValid = true;
			    }


		      // Passes valid calender month input into other function
		      if(this.arrayOfIds[i] === "#month-dropdown"){
		      		//console.log('in month data');

					this.monthInputValid = true;
					//console.log('In month');
				}
			}
		}
	}
});