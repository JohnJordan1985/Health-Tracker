
// /js/FoodListItem.js
/**
  * @desc File that creates View for the display of a Food Model
  * @author John Jordan johnjordan1985@gmail.com
  * @date 12 April 2016
  */

var app = app || {};
app.FoodView = Backbone.View.extend({
    tagName: 'li',

    //If user clicks on the list element, the toggleFood method is called
    events: {
        'click': 'toggleFood'
    },

    model: app.Food,

    /** Default template is 'results-template'. Had to manually set a default, as 'this.options.selector'
      * couldn't be passed to template within Constructor definition, without errors arising
      */

    template : _.template( $('#results-template').html() ),

    initialize: function(options){
        this.options = options;

        /** Logic that changes list View template depending on food list, ie. searched or tracked foods, which
          * is based on selector passed in by the user when View created
          */

        if( this.options.selector === '#eaten-template') {
            //Sets template appropriate for list View item that has been created
            this.template = _.template( $(this.options.selector).html() );
        }

        _.bindAll(this, 'render', 'toggleFood', 'unrender');
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'remove', this.unrender);

    },

    render: function(){

        var item = $(this.el);

        // Following code was replaced with CSS as I wanted to style the list in a certain manner,
        // But having this code specify the background color of the list frustrated my efforts.

        if (this.model.get('checked') === true) {
            item.css('background-color', '#33cc33');
        // } else {
        //     item.css('background-color', '#ffffff');
        }

        $(this.el).html( this.template( this.model.attributes) );
        //Sets check box to reflect model check status
        $('input', this.el).prop('checked', this.model.get('checked') );

        return this;
    },

    //When user clicks on food item, the model's ''checked'' property is changed

    toggleFood: function(){
        this.model.toggle();
    },

    unrender: function(){

        $(this.el).remove();

        $("#user-message").addClass('styled');
    }
});