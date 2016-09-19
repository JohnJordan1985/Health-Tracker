
// /js/Views/IntegratedSearchViewEditDay.js

/**
  * @desc File that creates tab for the display of the 'Search' tab within the Edit day tab
  * @author John Jordan johnjordan1985@gmail.com
  * @date 10 May 2016
  */
var app = app || {};


app.IntegratedSearchViewEditDay = Backbone.View.extend({
    el: '#user-message',

    events: {
        'click #submit-button': 'submit',

        'keypress input#search-box': 'submitIfEnterKeyPressed',

        // Changed this code to call eatCheckedFoods when user clicks on food item in list

        //If user clicks on item from IntegratedSearchView returned list
        'click .search-results' : 'eatCheckedFoods'
        //Moved this call to parent view, Edit Day
        // 'click .search-results': 'addToEditedFoods'
    },

    template: _.template('<form onsubmit="return false"><h1>Search for foods!</h1><input id="search-box" type="text"></form>'),

    initialize: function(){
        $(this.el).html(this.template);
        $(this.el).append('<button class="drop-down" id="cancel-button-editDay" type="button">Cancel</button><button id="submit-button" class="drop-down" type="button">Submit</button>');
        // $(this.el).append('<button id="add-today" type="button"><b> TODAY </b></button>');
        // $(this.el).append('<button id="add-edit" type="button"><b><span id="edit-date"></span></b></button>');
        $(this.el).css("background-color", "#3c3");
        $(this.el).append('<hr>');
        _.bindAll(this, 'render', 'submit', 'nutritionixRequest', 'generateCollectionFromApi', 'saveFoods', 'submitIfEnterKeyPressed');

        // Next three lines addes loading GIF to View, then hides it until needed
        $(this.el).append('<img id="gif-loader" src="assets/images/ajax-loader-green.gif" alt="Loading GIF displayed">');
        this.gifLoader = $("#gif-loader", this.el);
        // Hide GIF loading image until user selects 'Submit'
        this.gifLoader.hide();

        $(this.el).append('<ul id="list"></ul>');
        this.listenTo(app.searchResults, 'add', this.render);
        this.listenTo(app.collectionSelectedFromLog, 'change add remove', this.saveFoods);
        // Tests to catch app.dateSelectedFromLog variable with various values that it may have

        if (typeof app.dateSelectedFromLog === 'undefined' || app.dateSelectedFromLog === null || app.dateSelectedFromLog === '' || app.daySelectedFromLog === ''){
            app.myDay = 'No day selected';
            $('#add-edit', this.el).remove();
        } else {
            app.myDay = app.daySelectedFromLog + ', '+app.dateSelectedFromLog;
            $('#edit-date', this.el).text(app.dateSelectedFromLog);
        }

        //cache reference to list DOM element
        this.list = $('#list', this.el);
        //cache reference to user-message DOM element
        this.userMessage = $('#user-message', this.el);

        //Reference to body DOM element

        this.bodyReference = $('html, body');

        // Calcs document height for use later in code to redirect user to base of page

        this.docHeight = $(document).height();
    },

    render: function(){

        //Clears current search list

        this.list.empty();

        //Only display results of previous results if there are searches to show

        if(app.searchResults.length >  1) {
            app.searchResults.each(function(model){
                //Creates a new View for each Model in the previous search result's Collection
                var view = new app.FoodView({
                    model: model,
                    selector: '#results-template',
                    className: 'search-results'
                });
                //Append newly created view to list DOM element
                this.list.append(view.render().el);
            }, this);
        }
        return this;
    },

    submit: function(e){
        app.searchResults.reset();
        this.list.empty();
        var input = $('#search-box', this.el).val().trim();
        // Show GIF loading image when user clicks 'Submit' button and food list hasn't been loaded
        this.gifLoader.show();
        this.nutritionixRequest(input, this.generateCollectionFromApi);
    },

    nutritionixRequest: function(food, cb){
        var url = app.nutritionixUrlStart + food + app.nutritionixUrlFields;
        $.ajax({
            url: url,
            cache: true,
            dataType: 'json',
            context: this,

            success: function(results){
                // Hide GIF loading image
                this.gifLoader.hide();
                if(cb){
                    cb(results);
                }
            },
            error: function(){
                // Hide GIF loading image
                this.gifLoader.hide();
                //Notify user of error in connection
                app.notifyUser("The Nutritionix API server couldn't be reached. Please check your internet connection and try again.", [], '#user-message', '#f22');
            }
        });
    },

    generateCollectionFromApi: function(results){
        // Empties searchResults Collection to avoid duplicate entries
        app.searchResults.reset();
        var input = $('#search-box', this.el).val().trim();

        //Iterate through server response and create new food models for each item in response

        for(var i = 0; i < 5; i++){

        // _.each(results.hits, function(item){
            var food = new app.Food ({
                type: results.hits[i].fields.item_name,
                brand: results.hits[i].fields.brand_name,
                protein: results.hits[i].fields.nf_protein,
                fat: results.hits[i].fields.nf_total_fat,
                carbs: results.hits[i].fields.nf_total_carbohydrate,
                calories: results.hits[i].fields.nf_calories,
                unit: results.hits[i].fields.nf_serving_size_unit,
                gramUnit: results.hits[i].fields.nf_serving_weight_grams,
                servingUnitSize: results.hits[i].fields.nf_serving_size_qty
            });


            if(food.get('brand') === 'USDA' || food.get('brand') === ''){
                food.set({'brand': input});
            }

            app.searchResults.add(food);
        }
    },

    eatCheckedFoods: function(){

        var myList = [];

        app.searchResults.each(function(food){
            if(food.get('checked') === true){

                app.dailyTrackedFoods.add(food);

                // Unchecks model after adding to app.dailyTrackedFoods
                food.set({checked: false});

                // Adds food to array to be removed from searched foods Collection
                myList.push(food);
            }
        });

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

        if (app.myClickedFood !== ""){
                app.globalUserMessage = 'You just added the following to your tracked foods for today:\n' + '<br>' +  app.myClickedFood.get('brand') + ', ' + app.myClickedFood.get('type');

                console.log(app.myClickedFood);
                app.myClickedFood.set('checked', !app.myClickedFood.get('checked'));
        } else {

            app.globalUserMessage = "You haven't selected a food to add a serving of!" +'<br>' + "Please search for a food, select it, then click the button to add it.";
            this.userMessage.addClass('styled');
        }

        app.myClickedFood = "";

        //Resets user's view

        //this.todayTab.click();

        //Scrolls user's view to bottom of screen so that user message can be viewed and added food seen

        this.bodyReference.scrollTop(this.docHeight);

    },

    //Code for this function disabled, as function moved to part view EditView.js

    addToEditedFoods: function(){

        // //Holding array to push checked foods to

        // var myList = [];

        // app.searchResults.each(function(food){
        //     if(food.get('checked') === true){

        //         //Adds the checked food to the collection associated with the day being edited

        //         app.collectionSelectedFromLog.add(food);

        //         //Unchecks model after adding to app.collectionSelectedFromLog
        //         food.set({checked: false});

        //         //Adds food to array to be removed from searched foods Collection
        //         myList.push(food);
        //     }
        // });

        // * Code only executed if user has actually selected a searched food
        //   * to add to their tracked foods collection


        // if (myList.length > 0) {
        //     // removes array of foods models that were added to daily tracking Collection

        //     app.searchResults.remove(myList);

        //     // Passes to helper function to notify user indicating what foods were added to their tracked foods

        //     app.notifyUser('You just added the following to the day you are editing:<br>' + app.myDay, myList, '#user-message', 'other');
        //     this.userMessage.addClass('styled');

        // }

        // //Force call to render method

        // this.render();

    },

    saveFoods: function(){
        app.dayLog.each(function(day){
            if(day.get('id') === app.dateSelectedFromLog){
                day.set({'collection': app.collectionSelectedFromLog });
            }
        }, this);
    },

    submitIfEnterKeyPressed: function(e){
        console.log('Pressed');
        if(e.keyCode === 13){
            this.submit();
        }
    }
});