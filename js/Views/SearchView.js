
// /js/Views/SearchView.js

/**
  * @desc File that creates tab for the display of the 'Search' tab
  * @author John Jordan johnjordan1985@gmail.com
  * @date 12 April 2016
  */
var app = app || {};


app.SearchView = Backbone.View.extend({
    tagName: 'section',

    events: {
        'keyup #search-box': 'submit',
        'click button#add-today' : 'eatCheckedFoods',
        'click button#add-edit': 'addToEditedFoods'
    },

    template: _.template('<form onsubmit="return false"><h1>Search for foods!</h1><input id="search-box" type="text"></form>'),

    initialize: function(){
        $(this.el).html(this.template);
        $(this.el).prepend('<h1 id="user-message"></h1>');
        $(this.el).append('<p>Add Checked Items To: </p>');
        $(this.el).append('<button id="add-today" type="button"><b> TODAY </b></button>');
        $(this.el).append('<button id="add-edit" type="button"><b><span id="edit-date"></span></b></button>');
        $(this.el).append('<hr>');
        _.bindAll(this, 'render', 'submit', 'nutritionixRequest', 'generateCollectionFromApi', 'eatCheckedFoods', 'saveFoods');
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
                    selector: '#results-template'
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
        this.nutritionixRequest(input, this.generateCollectionFromApi);
    },

    nutritionixRequest: function(food, cb){
        var url = app.nutritionixUrlStart + food + app.nutritionixUrlFields;
        $.ajax({
            url: url,
            cache: true,
            dataType: 'json',
            success: function(results){
                if(cb){
                    cb(results);
                }
            },
            error: function(){
                //Notify user of error in connection
                app.notifyUser("The Nutritionix API server couldn't be reached. Please check your internet connection and try again.", [], '#user-message', '#f22');
            }
        });
    },

    generateCollectionFromApi: function(results){
        var input = $('#search-box', this.el).val().trim();

        //Iterate through server response and create new food models for each item in response
        _.each(results.hits, function(item){
            var food = new app.Food ({
                type: item.fields.item_name,
                brand: item.fields.brand_name,
                protein: item.fields.nf_protein,
                fat: item.fields.nf_total_fat,
                carbs: item.fields.nf_total_carbohydrate,
                calories: item.fields.nf_calories,
                unit: item.fields.nf_serving_size_unit,
                gramUnit: item.fields.nf_serving_weight_grams,
                servingUnitSize: item.fields.nf_serving_size_qty
            });


            if(food.get('brand') === 'USDA' || food.get('brand') === ''){
                food.set({'brand': input});
            }

            app.searchResults.add(food);
        });
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

        /** Code only executed if user has actually selected a searched food to add to
          * their tracked foods collection
          */

        if (myList.length > 0) {
            //removes array of foods models that were added to daily tracking Collection

            app.searchResults.remove(myList);

            //Passes to helper function to notify user indicating what foods were added to their tracked foods

            app.notifyUser('You just added the following to your tracked foods for today', myList, '#user-message');
            this.userMessage.addClass('styled');
        } else {
            //If no food items selected, inform user
            app.notifyUser("You haven't selected a food to add a serving of!" +'<br>' + "Please search for a food, select it, then click the button to add it.", [], '#user-message');
            this.userMessage.addClass('styled');
        }

    },

    addToEditedFoods: function(){

        //Holding array to push checked foods to

        var myList = [];

        app.searchResults.each(function(food){
            if(food.get('checked') === true){

                //Adds the checked food to the collection associated with the day being edited

                app.collectionSelectedFromLog.add(food);

                //Unchecks model after adding to app.collectionSelectedFromLog
                food.set({checked: false});

                //Adds food to array to be removed from searched foods Collection
                myList.push(food);
            }
        });

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

    },

    saveFoods: function(){
        app.dayLog.each(function(day){
            if(day.get('id') === app.dateSelectedFromLog){
                day.set({'collection': app.collectionSelectedFromLog });
            }
        }, this);
    },
});