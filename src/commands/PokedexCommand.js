const cheerio = require("cheerio");
const request = require("request");

import Cache from '../common/Cache.js';
import Log from '../common/Log.js';

export default class PokedexCommand {

    static doCommand(command, from, to, callBack) {
		if (typeof callBack !== "function")
		    callBack = (msg) => {};

		var matches;
		if ((matches = command.match(/^!pokedex (.*?)$/)) && matches !== null) {
			var p = encodeURI(matches[1]);

			// Is this pokemon in the cache?
			var desc = Cache.instance.get('pokemon_' + p);
			if (desc) {
				callBack(desc);
				return;
			}

			// Request new data from the official pokemon website
		    request("http://www.pokemon.com/us/pokedex/" + p, function (error, response, html) {
				if (!error) {
					var $ = cheerio.load(html);
					var desc = $(".version-descriptions p");

					if (desc.length === 0)
					{
						callBack(from + ": " + p + " is not a pokémon!");
						return;
					}

					// Find a random description
					desc = desc.eq(Math.floor(Math.random() * desc.length));

					// Format the string a bit
					desc = desc.text();
					desc = desc.replace(/\s+/g, ' ');
					desc = desc.replace(/(\.|,)([\w])/g, '$1 $2');

					// Put the data in the cache
					Cache.instance.put('pokemon_' + p, 1440, desc);

					// Send the description back
					callBack(p + ": " + desc.replace(/(\n|\r)/g, ""));
					PokedexCommand.log(from + " looked up '" + matches[1] + "'");
				}
			});

		}
    }


    static getCommands() {
		return [
		    "!pokedex"
		];
    }


    static log(message) {
    	Log.log("[Pokedex] " + message);
    }

}
