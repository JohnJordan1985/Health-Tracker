# FEND-P5-B-Health-Tracker

##Project Overview

Using Backbone, a single page app was developed that tracks the user's calorie intake, as well as their macronutrient intake (protein, fat and carbohydrate). Typing food names into the search field will display a list of matching foods as provided by the Nutritionx API. Users are able to select an item from the list, and the item will be added to the list of foods the user is tracking. The total calorie count, as well as an analysis of the user's macronutrient intake, is also displayed

##How to Run the App

Navigate to index.html file located within the 'dist' folder and open it with either Firefox or Chrome. Since the application requires localStorage and localStorage is unavailable for local files with Microsoft Edge, this particular web browser is not supported at this time.


##Testing of 'switchOver' function

Each time the 'Daily Log' tab is entered, either by the user, or on app initialisation, the 'switchOver' function is called. It determines if a new calender day has begun and if so, updates the dailyLog Collection with the previously tracked calender day, as well as any additional calender days that have occurred since the last time it was called. The function can be tested in the following manner, without having to wait on a new calender day happening:

- On line 207 of the src/js/Views/LogView.js file, replace 'app.testTime = app.zeroHour;' with 'app.testTime = app.getIncrementedDate(x);', with the passed in parameter 'x' being the number of days in the future, as an integer.

- Refresh the application.

Since the first tab opened is the 'Daily Log' tab, the function will be automatically run. If it functions correctly, the 'Daily Log' list will display all the dates from the current calender date up to, but not including, the incremented date in the 'Daily Log'.


##Building Production Code

Production code built using the Grunt tool. Ran into difficulties in generating correct file structure for uglified JS files, as dist folder had the following structure 'dist/js/src/js/*', rather then the desired 'dist/js/*'. I manually altered the file structure as I couldn't configure the uglify task to automatically generate the desired output.


##References

- Backbone.js Documentation. "Documentation". (http://backbonejs.org/)

- jQuery API Documentation. "jQuery.ajax()".(http://api.jquery.com/jquery.ajax/)

- Mozilla Developer Network. "JSON". (https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON)

- Nutritionx API. "Nutritionx API v1.1 Documentation". (https://developer.nutritionix.com/docs/v1_1)

- StackOverflow. "Backbone trigger two methods in one event". (http://stackoverflow.com/questions/13363660/backbone-trigger-two-methods-in-one-event)

- StackOverflow. "Beginner Backbone Error"(http://stackoverflow.com/questions/16300422/beginner-backbone-error)

- StackOverflow. "Getting each model from a Backbone Collection". (http://stackoverflow.com/questions/16014854/getting-each-model-from-a-backbone-collection)

- StackOverflow. "what's the easiest way to put space between 2 side-by-side buttons in asp.net" (http://stackoverflow.com/questions/5119711/whats-the-easiest-way-to-put-space-between-2-side-by-side-buttons-in-asp-net)

