import Channel from './common/Channel.js';
import Config from './config.js';

// Command classes
import Facts from './commands/Facts.js';
import User from './commands/User.js';
import Wiki from './commands/Wiki.js';

// Libraries
const irc = require('irc');

// The actual class
export default class Pokedex {
    client = null;
    commands = {};

    constructor () {

        // Classes
        var classes = [
	    User,
            Wiki,
	    Facts
        ];

        // Load a list of Commands
	this.commands = {};
        for (var i in classes) {
            var c = classes[i];

	    if (c.init)
	        c.init();

            for (var j in c.getCommands()) {
                this.commands[c.getCommands()[j]] = c;
            }
        }

    }

    init () {

	// Create irc connection
	this.client = new irc.Client(Config.irc.server, Config.irc.botname, {
    	    channels: Config.irc.channels,
	    autoConnect: false
        });

	// Prevent message flooding
	this.client.activateFloodProtection();

	// Keep track of the users in the channels
	this.users = {};
	for (var i in Config.irc.channels) {
	    var channel = Config.irc.channels[i];
	    var client = this.client;
	    (function (channel, client) {
                client.addListener('names' + channel, (nicks) => {
    	            var users = [];
    	            for (var user in nicks) {
	  	        users.push(user);
	            }

		    Channel.instance.set(channel, {users});
	        });
	    }(channel, client));

	}
	
	// Create an event for incomming messages
	var client = this.client;
	var commands = this.commands;
	this.client.addListener('message', (from, to, message) => {

	    // Loop over commands to match one of them
	    for (var i in commands) {
   	        var regex = i;		
                if (message.match(new RegExp(regex))) {
		    commands[regex].doCommand(message, from, to, (msg) => {
		        client.say(to, msg);
		    });
	 	    break;
	        }
	    }

        });

	// Connect to irc!
	this.client.connect();

    }
}
