
// js/Views/DayListView.js

/**
  * @desc File that creates View for the display of the Day model data in the 'Log' tab
  * @author John Jordan johnjordan1985@gmail.com
  * @date 12 April 2016
  */

var app = app || {};


app.DayListView = Backbone.View.extend({

	tagName: 'li',

	template: _.template( $('#log-template').html() ),

	model: app.Day,

	events: {

		'click button.edit-day': 'selectDay'
	},

	initialize: function(options){

		this.options = options || {};
		_.bindAll(this, 'render', 'selectDay', 'unrender', 'unselectAll', 'reset');
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'remove', this.unrender);
		this.item = $(this.el);
		//cache reference to user-message DOM element
    	this.userMessage = $('#user-message');
		this.render();
	},

	render: function(){

		this.model.getTotals();

		this.item.html(this.template(this.model.attributes));

		if (this.model.get('checked') === true) {
            this.item.css('background-color', '#3c3');
        } //No else statement as didn't want to specify color of list item when not selected by user
        // as using CSS to nth style list

        $('input', this.el).prop('checked', this.model.get('checked'));

		return this;
	},

	selectDay: function(){

		/** When user first selects model, and it is unchecked, want to
		  * create global reference to the model's day and date and
		  * set checked status to true, with all other models unselected
		  */
		if (this.model.get('checked') === false){

			app.dateSelectedFromLog = this.model.get('id');
			app.daySelectedFromLog = this.model.get('day');
			var yday = app.daySelectedFromLog + ', ' + app.dateSelectedFromLog;
			//unselect all models
			this.unselectAll();
			//set this model's checked status to true
			this.model.set({'checked': true});
			//If user has selected a day, or deselected a day, notify them
			app.notifyUserDayEdited('The following day has been opened in the "Edit" tab: ', yday, '#user-message');
			this.userMessage.addClass('styled');
			if(this.model.get('collection').length === 0) {
				app.collectionSelectedFromLog = new app.FoodCollection();
			} else{
				app.collectionSelectedFromLog = new app.FoodCollection(this.model.get('collection'));
			}

		} else {
			/** If user clicks on a Day that is already checked, want to
			  * empty global reference to models day and date and uncheck model
			  */
			var nday = app.daySelectedFromLog + ', ' + app.dateSelectedFromLog;
			//If user has deselected a day, notify them
			app.notifyUserDayEdited('The following day has been removed from the "Edit" tab: ', nday, '#user-message', '#f22');
			this.userMessage.addClass('styled');
			this.reset();
		}
		// Opens 'Edit' tab to automatically direct user there
		//EDIT: Removed this click event on the Edit tab, as wanted to remove 'Edit' tab from Nav bar
		//$("#edit").click();
		//Instead, recreated new Edit View using call to AppView function
		app.appView.createEditView();
	},

	unrender: function(){

		$(this.el).remove();
	},

	unselectAll: function(){
		//Iterates through Log of Days and unchecks all Day Models
		app.dayLog.each(function(day){
			day.set({'checked': false});
		});
	},

	// Helper function that unchecks all models in dayLog and empties global variables

	reset: function(){

		app.dateSelectedFromLog = '';
		app.daySelectedFromLog = '';
		//unselect all models
		this.unselectAll();
	}
});