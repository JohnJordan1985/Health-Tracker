
// js/Models/Day.js

/**
  * @desc File that creates Backbone Model for each calender day tracked by the user
  * @author John Jordan johnjordan1985@gmail.com
  * @date 08 April 2016
*/

var app = app || {};

/**
  * Tracked calender day
  * @constructor
  */

app.Day = Backbone.Model.extend({
	defaults: {

		'checked': false,

		'calorieTotal': 0,

		'proteinTotal': 0,

		'fatTotal': 0,

		'carbTotal': 0

	},

	initialize: function(options){

		this.options = options || {};

		_.bindAll(this, 'toggle', 'getTotals');
		// Create timestamp for model using helper function to allow appropriate sorting
		app.timeStampAModel(this);
		this.listenTo(this, 'change', this.getTotals);
	},

	toggle: function () {
		this.set('checked', !this.get('checked'));
	},

	/** Iterates through foods in Model's Collection and obtains and sets totals
	  * for calories and macronutrients
	  */

	getTotals: function(){
		this.calorieTotal = 0;
		this.proteinTotal = 0;
		this.fatTotal = 0;
		this.carbTotal = 0;
		// Hack to catch if array passed through to day Model, which was an issue during development
		if(this.options.collection instanceof Array){
			this.options.collection.forEach(function(model){
				this.calorieTotal += model.calories;
				this.proteinTotal += model.protein;
				this.fatTotal += model.fat;
				this.carbTotal += model.carbs;
			}, this);

		} else {
			this.options.collection.each(function(model){

				this.calorieTotal += model.get('calories');
				this.proteinTotal += model.get('protein');
				this.fatTotal += model.get('fat');
				this.carbTotal += model.get('carbs');
			}, this);
		}
		// Sets Model's attributes to reflect new totals
		this.set('calorieTotal', Math.round(this.calorieTotal));
		this.set('proteinTotal', Math.round(this.proteinTotal));
		this.set('fatTotal', Math.round(this.fatTotal));
		this.set('carbTotal', Math.round(this.carbTotal));
	}
});

