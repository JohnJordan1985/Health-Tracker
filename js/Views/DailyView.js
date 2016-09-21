
// /js/Views/DailyView.js

/**
  * @desc File that creates tab that displays today's tracked foods
  * @author John Jordan johnjordan1985@gmail.com
  * @date 12 April 2016
  */

var app = app || {};

app.dailyViewSearchTerms = [];

/** Checks if localStorage exists and if it does
  * clones data from localStorage.
  */

if ( localStorage.foods) {


    var input = JSON.parse(localStorage.foods);
    var clone = new app.FoodCollection(input);
    app.dailyTrackedFoods = clone;
} else {

    app.dailyTrackedFoods = new app.FoodCollection();
}

/**
  * @constructor
  */
app.DailyView = Backbone.View.extend({

    tagName: 'section',

    events: {

        // 'click button#all-selected' : 'selectAll',

        // 'click button#clear-selected': 'clearSelected',
        'click #cancel-button-editDay': 'emptyMessageDiv',

        'click button.delete-serving-button': 'clearSelected',

        // 'click .search-results': 'eatCheckedFoods',

        // 'click button#add-today' : 'eatCheckedFoods',

        'click button#duplicate-serving': 'duplicateServing',

        'click button#add-serving': 'addServing'
    },

    initialize: function(){

        /** Create counter to record user clicks on 'Select All' button so as to ensure that ALL models
         * have the same checked status when it is pressed.
         */
        this.todaysDate = app.getTodaysDateFormatted(new Date());
        this.todaysDay = app.getDay();
        this.counter = 0;
        //Removed the following from the View as each food item now has own delete button
        //<button type="button" class="delete-button" id="clear-selected"> Delete </button>

        //Removed the following from the View due to change in structure
        //<button type="button" id="all-selected"> Select All </button>
        $(this.el).append('<h1>Foods you'+"'ve" +' picked today: ' + '<br><br>' + '<span class="avoid-wrap" id="todays-date">' + this.todaysDay + ', ' + this.todaysDate + '</span>' +  '</h1><button type="button" class="add-button" id="add-serving"> Add New Food </button>');
        $(this.el).append('<hr><ul id="eaten-food"></ul><hr><br>');
        $(this.el).append('<h1 id="user-message-footer"></h1><br>');
        $(this.el).prepend('<h1 id="user-message"></h1>');

        //cache DOM queries
        this.list = $('#eaten-food', this.el);

        //cache reference to user-message DOM element
        this.userMessage = $('#user-message', this.el);

        //cache reference to user-message-footer DOM element
        this.userMessageFooter = $('#user-message-footer', this.el);

        //Logic that tests to see if there are any saved messages for the user prior to Today's Tab being reset
        if (app.globalUserMessage === ""){
          this.userMessageFooter.html("");
          this.userMessageFooter.css("background-color", "white");

        } else {
          this.userMessageFooter.html(app.globalUserMessage);
          this.userMessageFooter.css("background-color", "#f72");
          // Empties app.globalUserMessage so that message to user is reset
          app.globalUserMessage ="";

        }

        _.bindAll(this, 'render', 'selectAll', 'clearSelected', 'addServing', 'removeFood', 'saveFoods', 'duplicateServing', 'emptyMessageDiv', 'emptyMessageFooterH1');

        this.listenTo(app.dailyTrackedFoods, 'change add remove', this.render);
        this.listenTo(app.dailyTrackedFoods, 'change add remove', this.getSearchTerms);

        //Listens for changes on tracked foods and automatically saves to localStorage
        this.listenTo(app.dailyTrackedFoods, 'change add remove', this.saveFoods);

        this.getSearchTerms();

        //Reference to body DOM element

        this.bodyReference = $('html, body');

        // Calcs document height for use later in code to redirect user to base of page

        this.docHeight = $(document).height();

        this.render();
    },

    render: function(){

        this.list.empty();

        app.dailyTrackedFoods.each(function(model){

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
            /** Unchecked is initial value, therefore even values for this.counter represent
              * unchecked status
              */
            app.dailyTrackedFoods.each(function(model){
                model.set({'checked': false});
            });
        } else {
            //Set checked status as true

            app.dailyTrackedFoods.each(function(model){
                model.set({'checked': true});
            });
        }
    },

    clearSelected: function(){

        var removeArray = [];

        _.each(app.dailyTrackedFoods.models, function(food){

            if( food.get('checked') === true) {
                removeArray.push(food);
            }
        }, this);

        if (removeArray.length > 0) {
            //remove selected foods from tracked foods collection
            app.dailyTrackedFoods.remove(removeArray);

            //Notify user of foods removed
            app.notifyUser("You just deleted the following from today's tracked foods:", removeArray, '#user-message', '#f22');
            this.userMessage.addClass('styled');
            //Scrolls user's view to top of screen so that user message can be viewed and added food seen

            this.bodyReference.scrollTop(0);

            //Empties user-message-footer h1 element

            this.emptyMessageFooterH1();

        } else {
            app.notifyUser("You haven't selected a food to delete!" +'<br>' + "If you want to delete a food, please select it from the list, then press the 'Delete' button.", [], '#user-message', 'red');
            this.userMessage.addClass('styled');
        }
    },

    addServing: function(){

        var integratedSearchView = new app.IntegratedSearchView;
        integratedSearchView.render().el;

        // var addedFoods = [];

        // app.dailyTrackedFoods.each(function(model){

        //     if (model.get('checked') === true) {

        //         //Creates new Food model using data pulled from selected Food model

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

        //     app.dailyTrackedFoods.add(addedFoods);

        //     //app.Notify user of foods servings that have been added

        //     app.notifyUser('You just added servings of the following foods', addedFoods, '#user-message');
        //     this.userMessage.addClass('styled');
        // } else {

        //     app.notifyUser("You haven't selected a food to add a serving of!" +'<br>' + "If you want to add a food item, please go to the 'Search For Food' tab", [], '#user-message');
        //     this.userMessage.addClass('styled');
        // }
    },

    removeFood: function(food){
        console.log(food);
    },

    saveFoods: function(){

        //Convert Collection to JSON string for passage to localStorage
        var t = JSON.stringify(app.dailyTrackedFoods);
        localStorage.foods = t;
    },

    /** Function that iterates through daily tracked foods and obtains an array
      * of search words to use in NYT API request
      */
    getSearchTerms: function(){
        //Clears global array ahead of pushing new models, if any, to array
        app.dailyViewSearchTerms = [];
        app.dailyTrackedFoods.each(function(model){
            app.dailyViewSearchTerms.push(model.get('brand'));
        });
    },

    //Edit 21 September 2016 : This functionality moved to IntegratedSearchView.js

    // eatCheckedFoods: function(){
    //     console.log('eatCheckedFoods entered!');

    //     var myList = [];

    //     app.searchResults.each(function(food){
    //         if(food.get('checked') === true){

    //             app.dailyTrackedFoods.add(food);

    //             // Unchecks model after adding to app.dailyTrackedFoods
    //             food.set({checked: false});

    //             // Adds food to array to be removed from searched foods Collection
    //             myList.push(food);
    //         }
    //     });

    //     /** Code only executed if user has actually selected a searched food to add to
    //       * their tracked foods collection
    //       */

    //     if (myList.length > 0) {
    //         //removes array of foods models that were added to daily tracking Collection

    //         app.searchResults.remove(myList);

    //         //Passes to helper function to notify user indicating what foods were added to their tracked foods

    //         app.notifyUser('You just added the following to your tracked foods for today', myList, '#user-message');
    //         this.userMessage.addClass('styled');
    //     } else {
    //         //If no food items selected, inform user
    //         app.notifyUser("You haven't selected a food to add a serving of!" +'<br>' + "Please search for a food, select it, then click the button to add it.", [], '#user-message');
    //         this.userMessage.addClass('styled');
    //     }

    //     // Force call to render as listener events not functioning for some reason

    //     this.render();
    // },

    //end edit 21 September 2016

    duplicateServing: function(){
        //console.log(app.myClickedFood);

        //In order to set selected Food model toggle status to 'false'
        //need to explictly set it to 'false', as it will be triggered once
        //user clicks on 'Add +1' button

        app.myClickedFood.set('checked', false);


        //Note! Creating new Backbone Model needs properties formatted as JSON

        // var duplicateFood = new app.Food(app.myClickedFood);
        // console.log(duplicateFood);

        app.duplicateFoodJSON = new app.Food(app.myClickedFood.toJSON());

        //Confirmed that duplicateFoodJSON is a new Backbone Model
        //console.log(duplicateFoodJSON);


        //Add servings of clicked food to tracked foods collection
        app.dailyTrackedFoods.add(app.duplicateFoodJSON);

        //Notify user of foods servings that have been added

        app.globalUserMessage = 'You just added the following to your tracked foods for today:\n' + '<br>' +  app.duplicateFoodJSON.get('brand') + ' <i>(' + app.duplicateFoodJSON.get('type') + ')</i>';


        app.duplicateFoodJSON.set('checked', true);

        //Timeout call that resets checked value of Model after user alerted that new food added

        setTimeout(function(){
            app.duplicateFoodJSON.set('checked', false);
            //Wipe global reference
            app.duplicateFoodJSON = "";
        }, 2000);

        //Scrolls user's view to bottom of screen so that user message can be viewed and added food seen

        this.bodyReference.scrollTop(this.docHeight);

        //Edit Don't need this code anymore

        // //Empties user-message-footer h1 element

        // this.emptyMessageFooterH1();

        //end edit

        this.userMessageFooter.html(app.globalUserMessage);
        this.userMessageFooter.css("background-color", "#f72");
        // Empties app.globalUserMessage so that message to user is reset
        app.globalUserMessage ="";

        //Empties global variable

        app.myClickedFood = "";
    //     var addedFoods = [];

    //     app.dailyTrackedFoods.each(function(model){

    //         if (model.get('checked') === true) {

    //             //Creates new Food model using data pulled from selected Food model

    //             var m = new app.Food(model.toJSON());
    //             //Reset toggle status of duplicated Food model
    //             model.toggle();
    //             m.toggle();

    //             //Adds clone of selected Food model to holder array
    //             addedFoods.push(m);
    //         }
    //     }, this);

    //     if (addedFoods.length > 0) {
    //         //Add servings of selected foods to tracked foods collection

    //         app.dailyTrackedFoods.add(addedFoods);

    //         //app.Notify user of foods servings that have been added

    //         app.notifyUser('You just added servings of the following foods', addedFoods, '#user-message');
    //         this.userMessage.addClass('styled');

    //         //Scrolls user's view to top of screen so that user message can be viewed and added food seen

    //         this.bodyReference.scrollTop(0);

    //         //Empties user-message-footer h1 element

    //         this.emptyMessageFooterH1();

    //     } else {

    //         app.notifyUser("You haven't selected a food to add a serving of!" +'<br>' + "If you want to add a food item, please go to the 'Search For Food' tab", [], '#user-message');
    //         this.userMessage.addClass('styled');
    //     }
    },

    //Clears out userMessage DOM element when user cancels addition of food item
    emptyMessageDiv: function(){

        this.userMessage.empty();
        this.userMessage.removeClass('styled');
        this.userMessage.css('background-color', 'white');
    },

    // Function that clears out DOM element displayed at base of screen

    emptyMessageFooterH1: function(){

        this.userMessageFooter.empty();
        this.userMessageFooter.removeClass('styled');
        this.userMessageFooter.css('background-color', 'white');

    }
});

