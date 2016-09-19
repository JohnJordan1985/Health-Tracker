
// /js/Models/Food.js
/**
  * @desc File that creates Backbone Model for each food chosen by the user
  * @author John Jordan johnjordan1985@gmail.com
  * @date 08 April 2016
*/

var app = app || {};

/**
  * @constructor
  */

app.Food = Backbone.Model.extend({
    defaults: {
        type: '',
        brand: '',
        protein: 0,
        fat: 0,
        carbs: 0,
        calories: 0,
        unit: 0,
        gramUnit: 0,
        servingUnitSize: 0,
        checked: false
    },

    toggle: function(){
        this.set('checked', !this.get('checked'));
    }
});