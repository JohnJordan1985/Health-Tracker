
// /js/Views/AppView.js

/**
  * @desc File that creates global View for application
  * @author John Jordan johnjordan1985@gmail.com
  * @date 06 April 2016
  */
var app = app || {};

/**
  * @constructor
  */

app.globalUserMessage = "";

// Variable that holds value of a food item selected from the IntegratedSearchView

app.myClickedFood = "";

app.AppView = Backbone.View.extend({
    el: $('body'),

    events: {
        'click button#search': function(e){
            this.createSearchView();
            this.idOfClicked(e);
        },
        'click button#daily': function(e){
            this.createDailyView();
            this.idOfClicked(e);
        },
        'click button#analysis': function(e){
            this.createAnalysisView();
            this.idOfClicked(e);
        },
        'click button#news': function(e){
            this.createNewsView();
            this.idOfClicked(e);
        },

        'click button#log': function(e){
            this.createLogView();
            this.idOfClicked(e);
        },

        'click button#edit': function(e){
            this.createEditView();
            this.idOfClicked(e);
        },

        'click button#home': function(e){
            this.createHomeView();
            this.idOfClicked(e);
        },
    },

    initialize: function(){
        //$('nav', this.el).prepend('<div style="display: flex;" id="first-row"></div>');
        //$('nav', this.el).append('<div id="second-row"></div>');
        this.nav = $('nav', this.el);
        this.nav.append('<button  type="button" id="daily"> Today </button>');
        //Removed the 'Search' tab as search function integrated into each day list
        // $('#first-row', this.el).append('<button class="tab" type="button" id="search"> Search for Food </button>');
        this.nav.append('<button  type="button" id="news"> News </button>');
        this.nav.append('<button  type="button" id="analysis"> Analysis </button>');

        this.nav.append('<button  type="button" id="log"> Log </button>');
        this.nav.prepend('<button  type="button" id="home"> Home </button>');
        //Removed the 'Edit' tab from Nav bar
        // $('#second-row', this.el).append('<button class="tab-bottom" type="button" id="edit"> Edit </button>');
        _.bindAll(this, 'createSearchView', 'createDailyView', 'createAnalysisView', 'createLogView', 'createHomeView', 'invertColour');
        this.userView = $('#user-view', this.el);
        //Create variable for later use in toggling styles of clicked nav buttons ('tabs')
        this.prevId ='home'; // initial value of 'log' as Day Log tab is first opened
        this.invertColour(this.prevId); // Since Log tab selected, must invert colour
        //Needs call to 'Log View' in order to trigger teh critical swtichOver() function that
        //updates the daily log and transfers over the previous day's foods at midnight
        this.createLogView();
        //Renders 'Daily Log' view upon initial page rendering by browser
        this.createHomeView();
    },

    render: function(view) {
        this.userView.html( view.render().el);
    },

    createSearchView: function(){
        var search = new app.SearchView();
        this.render(search);
    },

    createAnalysisView: function(){
        var analysis = new app.AnalysisView();
        this.render(analysis);
    },

    createDailyView: function(){
        var daily = new app.DailyView();
        this.render(daily);
    },

    createNewsView: function(){

        var news = new app.NewsView();
        this.render(news);
    },

    createLogView: function(){
        var log = new app.LogView({
            collection: new app.Days()
        });
        this.render(log);
    },

    createEditView: function(){
        // $('#user-view', this.el).empty();
        var edit = new app.EditView();
        // edit.render().el;
        this.render(edit);
    },

    createHomeView: function(){
        var home = new app.HomeView();
        this.render(home);
    },

    /** @desc Function that obtains id of clicked button and calls the invertColour function
      * @param {click event} e - Passed click event
      */

    idOfClicked: function(e){
        //Get id of clicked button
        var id = e.currentTarget.id;
        //Invert colour of currently clicked button and next most recently clicked button
        this.invertColour(id);
        this.invertColour(this.prevId);
        //Save id of currently clicked button to access on next function call
        this.prevId = id;
    },

    /** @desc Function that inverts colour of button element to guide user selection
      * @param {string} id - Id of clicked button
      */
    invertColour: function(id){
        var button = $('button#' + id, this.el);

        //get current background and font colours
        var currentBackground = button.css('background-color');
        var currentFont = button.css('color');

        //Invert button colour and background-colour attributes
        button.css('background-color', currentFont);
        button.css('color', currentBackground);
    }
});



