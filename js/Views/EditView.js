
//js/Views/EditView.js

/**
  * @desc File that creates tab for the display of the 'Edit' tab
  * @author John Jordan johnjordan1985@gmail.com
  * @date 12 April 2016
  */

var app = app || {};

app.collectionSelectedFromLog = new app.FoodCollection();

app.EditView = Backbone.View.extend({

	tagName: 'section',

    // el: '#user-view',

	events: {

        // 'click button#all-selected' : 'selectAll',

        // 'click button#clear-selected': 'clearSelected',

        'click button#add-serving': 'addServing',

        'click .search-results': 'addToEditedFoods',

        'click button.delete-serving-button': 'clearSelected',

        'click #cancel-button-editDay': 'emptyMessageDiv',

        'click button#delete-day-button': 'deleteDay',

        'click button#no-delete': 'cancelDeletion',

        'click button#duplicate-serving': 'duplicateServing',

        'click button#yes-delete': 'confirmDeletion',

        'click button.back-button': 'backToDayLog'
    },

    initialize: function(){

    	app.dayLog.each(function(day){
    		if(day.get('id') === app.dateSelectedFromLog){
    			//Retrieve Day Model that is being edited from app.dayLog
                this.editDay = day;

                app.collectionSelectedFromLog = new app.FoodCollection(day.get('collection'));

    			/** This code is designed to catch situations when either a Collection, or an array
    			  * are passed into the initialise function. If day.get('collection') returns a Collection
                  *	then a.models is used to construct a new FoodCollection
                  */
    			var a = day.get('collection');
    			if(a.models){
    				app.collectionSelectedFromLog = new app.FoodCollection(a.models);
    			} else {
    				/** If day.get('collection') returns an array, it is passed directly to app.FoodCollection constructor*/

                    app.collectionSelectedFromLog = new app.FoodCollection(day.get('collection'));
    			}
    		}
    	}, this);


    	//Catches instances where user has not selected any Day from the LogView

    	if (typeof this.editDay === 'undefined' || this.editDay === null) {
    		//Creates a new Day model instance to avoid errors further in code
    		this.editDay = new app.Day();
    		//Clears out app.collectionSlectedFromLog when no day selected from Log View by user
    		app.collectionSelectedFromLog = new app.FoodCollection();
		}

        // Removed the following as no longer required
        //<button type="button" class="delete-button" id="clear-selected">Delete</button>
        //Removed the following from the View due to change in structure
        //<button type="button" id="all-selected"> Select All </button>

        $(this.el).append('<h1 id="edit-info">You are currently editing:<br> <span class="avoid-wrap" id="date-picked"></span></h1><button type="button" class="back-button">Back to Log</button><button type="button" class="add-button" id="add-serving">Add New Food </button>');
        $(this.el).append('<hr><ul id="eaten-food"></ul><hr><br>');
        //'Delete Day' button
        $(this.el).append('<br><h1 id="delete-button-container"><button class="delete-day-button" id="delete-day-button" type="button">Delete Day</button></h1>')
        $(this.el).prepend('<h1 id="user-message"></h1>');

        _.bindAll(this, 'render', 'selectAll', 'clearSelected', 'addServing', 'removeFood', 'saveFoods', 'addToEditedFoods', 'emptyMessageDiv', 'deleteDay', 'cancelDeletion', 'confirmDeletion', 'saveLog', 'duplicateServing', 'backToDayLog');

        //cache DOM queries
        this.list = $('#eaten-food', this.el);
        //cache reference to user-message DOM element
        this.userMessage = $('#user-message', this.el);

        this.listenTo(app.collectionSelectedFromLog, 'change add remove', this.render);

        //Listens for changes on tracked foods and automatically saves to localStorage

        this.listenTo(app.collectionSelectedFromLog, 'change add remove', this.saveFoods);

        //Template for deletion confirmation

        this.confirmationTemplate = _.template($("#deletion-confirmation").html());

        this.deleteButtonContainer = $('#delete-button-container', this.el);

        this.render();

        this.counter = 0;
    },

    render: function(){

    	//Clear out list of previously rendered entities

        this.list.empty();
        if (typeof app.dateSelectedFromLog === 'undefined' || app.dateSelectedFromLog === null || app.dateSelectedFromLog === '' || app.daySelectedFromLog === ''){

			$('#date-picked', this.el).text('No day selected.');
            $('#date-picked', this.el).append('<br>Please select a day from the "Daily Log" tab.');
		} else {
			$('#date-picked', this.el).text(app.daySelectedFromLog + ', '+app.dateSelectedFromLog);
		}

        app.collectionSelectedFromLog.each(function(model){

            var eatenFood = new app.FoodView({
                model: model,
                selector: '#eaten-template'
            });

            this.list.append( eatenFood.render().el );
        }, this);

        return this;
    },


    selectAll: function(){
        this.counter++;
        /** To avoid some models having checked status opposite of other models in the
          * collection, if they were clicked prior to 'Select All' button being clicked by user,
          * needed to refer to this.counter's parity and set ALL model's check status to the same value.
          */

        if( this.counter%2 === 0 ) {
            //Unchecked is initial value, therefore even values for this.counter represent unchecked status
            app.collectionSelectedFromLog.each(function(model){
                model.set({'checked': false});
            });
        } else {
            //Set checked status as 'true'
            app.collectionSelectedFromLog.each(function(model){
                model.set({'checked': true});
            });
        }
    },

    clearSelected: function(){

        var removeArray = [];

        _.each(app.collectionSelectedFromLog.models, function(food){

            if( food.get('checked') === true) {
                removeArray.push(food);
            }
        }, this);

        if (removeArray.length > 0) {
            //remove selected foods from tracked foods collection
            app.collectionSelectedFromLog.remove(removeArray);

            //Notify user of foods removed
            app.notifyUser('You just deleted the following:', removeArray, '#user-message', '#f22');
            $("#user-message").addClass('styled');
        } else {
            app.notifyUser("You haven't selected a food to delete!" +'<br>' + "If you want to delete a food, please select it from the list, then press the 'Delete' button.", [], '#user-message', 'red');
            this.userMessage.addClass('styled');
        }
    },

    addServing: function(){

        var searchWindow = new app.IntegratedSearchViewEditDay;
        searchWindow.render().el;

        // var addedFoods = [];

        // app.collectionSelectedFromLog.each(function(model){

        //     if (model.get('checked') === true) {

        //         var m = new app.Food(model.toJSON());
        //         //Reset toggle status of duplicated Food model
        //         model.toggle();
        //         m.toggle();

        //         //Adds clone of selected Food model to holder array
        //         addedFoods.push(m);

        //     }
        // }, this);

        // if (addedFoods.length > 0) {
        //     //Add servings of selected foods to tracked foods collection

        //     app.collectionSelectedFromLog.add(addedFoods);

        //     //app.Notify user of foods servings that have been added

        //     app.notifyUser('You just added servings of the following foods', addedFoods, '#user-message');
        //     this.userMessage.addClass('styled');
        // } else {
        //     //If no food items selected, inform user
        //     app.notifyUser("You haven't selected a food to add a serving of!" +'<br>' + "If you want to add a food item, please go to the 'Search For Food' tab", [], '#user-message');
        //     this.userMessage.addClass('styled');
        // }
    },

    removeFood: function(food){
        food.destroy();
    },

    saveFoods: function(){

    	app.dayLog.each(function(day){
    		if(day.get('id') === app.dateSelectedFromLog){
    			day.set({'collection': app.collectionSelectedFromLog });
    		}
    	}, this);
    },

    addToEditedFoods: function(){

        //Holding array to push checked foods to

        var myList = [];
        console.log(myList);
        console.log(app.collectionSelectedFromLog);


        app.searchResults.each(function(food){
            if(food.get('checked') === true){

                //Adds the checked food to the collection associated with the day being edited

                app.collectionSelectedFromLog.add(food);

                //Unchecks model after adding to app.collectionSelectedFromLog
                food.set({checked: false});

                //Adds food to array to be removed from searched foods Collection
                myList.push(food);
            }
        }, this);

        /** Code only executed if user has actually selected a searched food
          * to add to their tracked foods collection
          */

        if (myList.length > 0) {
            // removes array of foods models that were added to daily tracking Collection

            app.searchResults.remove(myList);

            // Passes to helper function to notify user indicating what foods were added to their tracked foods

            app.notifyUser('You just added the following to the day you are editing:<br>' + app.myDay, myList, '#user-message', 'other');
            this.userMessage.addClass('styled');

        }

        console.log(myList);
        console.log(app.collectionSelectedFromLog);

        //Force call to render method
        this.render();
        this.saveLog();
    },

    //Clears out unneeded formatting once user cancels food search screen

    emptyMessageDiv: function(){

        this.userMessage.empty();
        this.userMessage.removeClass('styled');
        this.userMessage.css('background-color', 'white');
    },

    deleteDay: function(){

        app.dayLog.each(function(day){
          if(day.get('checked') === true) {
            //Sets holder variable to Day model that is to be deleted from Collection
            this.testForDayToDelete = true;
            this.actualDayToDelete = day;
            //open confirmation window
            this.deleteButtonContainer.html(this.confirmationTemplate(day.attributes));
            //Add appropriate styling to DOM element
            this.deleteButtonContainer.addClass('styled');
            this.deleteButtonContainer.css("background-color", "#3c3");
          }
        }, this);

        //No need to notify user that no day selected, as change in structure means
        //no day is selected in the manner expected
        // if(this.testForDayToDelete === false){
        //   app.notifyUser("You haven't selected a day to delete!" +'<br>' + "If you want to delete a day, please select it from the Log tab list, then press the 'Delete' button.", [], '#delete-button-container', 'red');
        //   this.deleteButtonContainer.addClass('styled');
        // }
        // //reset holder variable
        // this.testForDayToDelete = false;
    },

    //Function that clears out information from user-message DOM element

    cancelDeletion: function(){
        this.deleteButtonContainer.empty();
        this.deleteButtonContainer.removeClass('styled');
        this.deleteButtonContainer.css("background-color", "white");
        this.deleteButtonContainer.append('<button class="delete-day-button" id="delete-day-button" type="button">Delete Day</button>');
        this.deleteButtonContainer.prepend('<br><button type="button" class="back-button">Back to Log</button>');
    },
    //Function that removes the checked Day Model from the app.dayLog Collection

    confirmDeletion: function(){
        this.actualDayToDelete.trigger('destroy', this.actualDayToDelete );
        //This code merely removed model from a collection, rather than destroying it
        // app.dayLog.remove(this.actualDayToDelete);

        var msg = "You have just deleted the following day from your records:" + "\n" + this.actualDayToDelete.get('day') + ', ' + this.actualDayToDelete.get('id');
        app.globalUserMessage = "You have just deleted the following day from your records:" + '<br>' + this.actualDayToDelete.get('day') + ', ' + this.actualDayToDelete.get('id') ;
        //app.notifyUser("You have just deleted the following day from your records:" +'<br>' + this.actualDayToDelete.get('day') + ', ' + this.actualDayToDelete.get('id') , [], '#delete-button-container', 'red');
        this.deleteButtonContainer.addClass('styled');
        //Explicit call to this.saveLog as listener not working
        this.saveLog();
        //Clears list of displayed food items from deleted day
        this.list.empty();
        //Clears out default info window for EditView tab
        $("#edit-info", this.el).empty();
        //Return user to Daily Log after deletion of a day
        this.backToDayLog();
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
        console.log(localStorage.dayLog.models);
        console.log(app.dayLog.models);
    },

    //Modified this code when copying from DailyView file to refer to
    //app.collectionSelectedFromLog, rather than 'app.dailyTrackedFoods'

    duplicateServing: function(){

        var addedFoods = [];

        app.collectionSelectedFromLog.each(function(model){

            if (model.get('checked') === true) {

                //Creates new Food model using data pulled from selected Food model

                var m = new app.Food(model.toJSON());
                //Reset toggle status of duplicated Food model
                model.toggle();
                m.toggle();

                //Adds clone of selected Food model to holder array
                addedFoods.push(m);
            }
        }, this);

        if (addedFoods.length > 0) {
            //Add servings of selected foods to tracked foods collection

            app.collectionSelectedFromLog.add(addedFoods);

            //app.Notify user of foods servings that have been added

            app.notifyUser('You just added servings of the following foods', addedFoods, '#user-message');
            this.userMessage.addClass('styled');
        } else {

            app.notifyUser("You haven't selected a food to add a serving of!" +'<br>' + "If you want to add a food item, please go to the 'Search For Food' tab", [], '#user-message');
            this.userMessage.addClass('styled');
        }
    },

    //Function that takes users back to Daily Log View
    backToDayLog: function(){
        $('#log').click();
    }

});