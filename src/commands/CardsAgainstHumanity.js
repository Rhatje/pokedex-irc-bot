const _ = require('underscore');
const fs = require('fs');

//import Cache from '../common/Cache.js';

/**
 * match random Cards Against Humanity cards
 */
export default class Users {

    static doCommand(command, from, to, callBack) {
        if (typeof callBack !== "function")
            callBack = (msg) => {};

        // Load the data
        fs.readFile(__dirname + '/../data/CardsAgainstHumanity.json', function(err, data) {
		    if (err) return;

            // Parse the data
            data = JSON.parse(data);

            // Get a random black card
            var c_black = _.sample(data.cards.black);

            // Replace underscores
            var combined = "";
            if (c_black.match(/_/) === null)
            {
                combined = c_black + " " + _.sample(data.cards.white);
            }
            else
            {
                combined = c_black.replace(/_/g, function () {
                    return _.sample(data.cards.white);
                });
            }

            // Send back to irc
            callBack(combined);

		});

    }

    static getCommands() {
    	return [
    	    "^!cah",
    	    "^!cardsagainsthumanity"
    	];
    }

}
