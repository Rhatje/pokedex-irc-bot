const cheerio = require("cheerio");
const request = require("request");

import Log from '../common/Log.js';

/**
 * Display a random joke
 */
export default class Users {

    static doCommand(command, from, to, callBack) {
        if (typeof callBack !== "function")
            callBack = (msg) => {};

        // Do logging
        this.log(from + " requested a joke");

        // Get a joke from a random website
        switch (Math.ceil(Math.random() * 1)) {
            case 1:
                this.getJokeOnelinefun(callBack);
                break;

            case 2:
                this.getJokeRD(callBack);
                break;
        }
    }

    static getCommands() {
    	return [
    	    "!joke"
    	];
    }

    static log(msg) {
        Log.log("[Jokes] " + msg);
    }



    /**
     *  Get a joke from onelinefun
     */
    static getJokeOnelinefun(callBack) {

        // First, find the number of pages
        request("http://onelinefun.com", function (error, response, html) {

            // Parse the html
            var $ = cheerio.load(html);

            // Find last page number
            var pnr = $(".pagination a").last().attr("href").replace(/[^\d]/g, '') * 1;

            // Load a random page
            request("http://onelinefun.com/" + Math.ceil(Math.random() * pnr) + "/", function (error, response, html) {

                // Find the jokes and load a random one
                var $ = cheerio.load(html);
                var jokes = $(".oneliner p");
                var joke = jokes.eq(Math.floor(Math.random() * jokes.length)).text();

                // Send it back
                callBack(joke);

            });


        });

    }


    /**
     *  Get a joke from http://www.rd.com/jokes/one-liners/
     */
    static getJokeRD(callBack) {

        // Load the page, get a random joke
        request("http://www.rd.com/jokes/one-liners/", function (error, response, html) {

            // Find the jokes and load a random one
            var $ = cheerio.load(html);
            var jokes = $(".Joke-Topic-one-liners:not(.Joke-Topic-funny-stories) .jokes-river--content");
            var joke = jokes.eq(Math.floor(Math.random() * jokes.length)).text().replace(/[^\x00-\x7F]/g, "").replace(/(?:\r\n|\r|\n)/g, "");

            // Send it back
            callBack(joke);

        });

    }

}
