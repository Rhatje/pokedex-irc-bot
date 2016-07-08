"use strict";

const fs = require('fs');

import Cache from '../common/Cache.js';
import Channel from '../common/Channel.js';
import Config from '../config.js';

/**
 *  !facts - Learn and display facts created by users
 */
export default class Facts {

    static doCommand(command, from, to, callBack) {
		if (typeof callBack !== "function")
		    callBack = function(msg){};

	        // Load all available facts
		var facts = JSON.parse(
		    Cache.instance.get(this.factsCacheSlug)
		);

		// What are we doing?
		var matches;
		if (command === "!facts")
		{
		    callBack("I know " + Object.keys(facts).length + " facts!");
		}
		else if ((matches = command.match(/^!fact ([\w\d-]+)/)) && matches !== null)
		{
		    // Is this fact in the cache?
		    if (matches.length < 2 || !facts.hasOwnProperty(matches[1])) {
			callBack("I do not know this fact");
		    }

		    // Find the fact and its info
		    var f = facts[matches[1]];
		    callBack("I learned " + matches[1]  + " from " + f[0]  + "! It has been used " + f[2] + " times.");
		}
		else if ((matches = command.match(new RegExp("^" + Config.irc.botname + ": !([\\w\\d-]+)(\\[(del)?\\])?( ([\\w\\d].*?))?$"))) && matches !== null)
		{
		    // Create the fact in the list
		    if (matches[2] === "[]") {
				if (facts.hasOwnProperty(matches[1]) && typeof (facts[matches[1]][1] === "object")) {
				    facts[matches[1]][1].push(matches[5]);
				} else {
				    facts[matches[1]] = [
				    	from,
				    	[matches[5]],
				    	0
				    ];
		    	}
		    } else if (matches[2] === "[del]") {
		    	if (facts.hasOwnProperty(matches[1]) && typeof (facts[matches[1]][1] === "object")) {
				    delete facts[matches[1]];
				    callBack("All !" + matches[1] + " responses have been removed by " + from + ", blame him/her!");
				}
		    } else {
		    	if (facts.hasOwnProperty(matches[1]) && typeof (facts[matches[1]] === "object")) {
					callBack(matches[1] + " is an array, use !" + matches[1] + "[] to add a value.");
		    	} else {
			    	facts[matches[1]] = [
					    from,
					    matches[5],
				   	    0
			    	];
		    	}
		    }

            // Save all facts
		    this.saveFacts(facts);
		}
		else if ((matches = command.match(/^!([\w\d-]+)(\s(.*?))?$/)) && matches !== null)
		{

		    // Is this fact in the cache?
	        if (matches.length < 2 || !facts.hasOwnProperty(matches[1])) {
	            return;
	        }

	        // Find the fact and its info
	        var f = facts[matches[1]];

		    // Update the usage
		    facts[matches[1]][2] = facts[matches[1]][2] + 1;
		    this.saveFacts(facts);

		    // Get the fact
		    var fact = f[1];
		    if (typeof fact === "object") {
				fact = fact[Math.floor(Math.random()*fact.length)];
		    }

		    // Replace parameters
		    fact = fact.replace(/%user%/g, from);
		    fact = fact.replace(/%randomuser%/g, function () {
				var users = Channel.instance.get(to).users;
		        var ruser;
		        if (users.length === 0) {
				    ruser = from;
		        } else {
				    ruser = users[Math.floor(Math.random() * users.length)];
		        }

				return ruser;
		    });
		    fact = fact.replace(/%param(:(.*?))?%/g, function (a, b, def) {
				if (matches.length > 3 && matches[3] !== undefined)
				    return matches[3];
				else
				    return def;
		    });

		    // Send the value back
	        callBack(fact);

		}

    };

    static getCommands() {
        return [
	    "^" + Config.irc.botname + ": ![\\w\\d+](\\[(del)?\\])?",
	    "^!facts$",
	    "^!fact [\\w\\d-]+$",
	    "^![\\w\\d]+"
        ];
    };


    static init() {

	// Set the cache slug
	this.factsCacheSlug = "facts_cache";

	// Load existing facts from file
	var fcs = this.factsCacheSlug;
	fs.readFile(__dirname + '/../facts.json', function(err, data){
	    if (err) return;
	    Cache.instance.put(fcs, -1, data);
	});

    }


    /**
     *	Save the facts to the cache and to a file
     */
    static saveFacts(facts) {

	if (JSON.stringify(facts).length === 0) return;

	// Save the list to the cache
	Cache.instance.put(this.factsCacheSlug, -1, JSON.stringify(facts));

	// Save the list to the file
	fs.writeFile(__dirname + '/../facts.json', JSON.stringify(facts));

    }

}
