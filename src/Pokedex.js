import Channel from './common/Channel.js';
import Config from './config.js';

// Command classes
import Countdown from './commands/Countdown.js';
import Facts from './commands/Facts.js';
import Jokes from './commands/Jokes.js';
import Logger from './commands/Logger.js';
import PokedexCommand from './commands/PokedexCommand.js';
import User from './commands/User.js';
import Wiki from './commands/Wiki.js';

// Libraries
const irc = require('irc');

// The actual class
export default class Pokedex {
	catchAlls = [];
    client = null;
    commands = {};

    constructor () {

        // Classes
        var classes = [
	    	Countdown,
	    	Jokes,
	    	Logger,
	    	PokedexCommand,
	    	User,
            Wiki,
	    	Facts
        ];

        // Load a list of Commands
		this.commands = {};
		this.catchAlls = [];
        for (var i in classes) {
            var c = classes[i];

			// Execute init functions
		    if (c.init)
		        c.init();

			// Add catchalls
		    if (c.catchAll)
		    	this.catchAlls.push(c);

			// Add commands to the list
			if (c.getCommands) {
	            for (var j in c.getCommands()) {
	                this.commands[c.getCommands()[j]] = c;
	            }
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
		    } (channel, client));
		}

		// Create an event for incomming messages
		var commands = this.commands;
		let msgevent = (from, to, message) => {

		    // Only read messages from channels or admins
		    if (Config.irc.channels.indexOf(to) === -1 && Config.irc.admins.indexOf(from) === -1)
				return;

		    // Don't reply to your own messages! moron!
		    if (Config.irc.botname === from)
				return;

		    // Loop over commands to match one of them
		    for (var i in commands) {
	   	        var regex = i;
                if (message.match(new RegExp(regex))) {
				    commands[regex].doCommand(message, from, to, (msg) => {
						if (msg.indexOf("/me ") === 0)
						    client.action(to, msg.substr(4));
						else
				            client.say(to, msg);

				    	Logger.catchAll(Config.irc.botname, to, msg);
			    	});
		 	    	break;
		        }
		    }

		    // Send the message to the catchalls
		    for (var i in this.catchAlls) {
		    	var ca = this.catchAlls[i];
		    	ca.catchAll(from, to, message);
		    }

        };
		this.client.addListener('message', msgevent);
		this.client.addListener('action', (from, to, message) => { msgevent(from, to, "/me " + message); });

		// Connect to irc!
		this.client.connect();

    }
}
