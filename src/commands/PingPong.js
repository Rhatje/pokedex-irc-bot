"use strict";

const _ = require('underscore');
const _s = require("underscore.string");
const file = __dirname + "/../data/pingpong.json";
const fs = require('fs');

import Cache from '../common/Cache.js';

/**
 * Playing PingPong!
 */
export default class PingPong {


    static doCommand(command, from, to, callBack) {

        if (command === '!pingpongscore')
        {
            this.getScore(to, callBack);
        }
        else if (command === '!pingpong')
        {
            this.startGame(from, to, callBack);
        }
        else if (command === '!join')
        {
            this.joinGame(from, to, callBack);
        }
        else if (_s.startsWith(command, "!ping") || _s.startsWith(command, "!pong"))
        {
            this.doPingPong(from, to, command, callBack);
        }

    }

    static getCommands() {
    	return [
    	    "^!join$",
    	    "^!ping ",
    	    "^!pingpong$",
    	    "^!pingpongscore",
    	    "^!pong "
    	];
    }

    static init() {

        // Create the game cache
        Cache.instance.rememberForever("pingpong", () => {});

    }




    /**
     *  Somebody is hitting the ball!
     */
    static doPingPong(from, channel, command, callBack) {

        // Is there a game in progress?
        var data = this.getGameData(channel);
        if (data.status !== 'playing')
            return;

        // Is the current user playing?
        if (data.players.indexOf(from) === -1)
            return;

        // Does this user have the ball?
        if (data.ball !== from) {
            callBack(from + ", you did not have the ball. You are out of the game and lost a point in the rankings.");
            this.kickUser(channel, from, callBack);
            this.setScore(channel, from, -1);
            return;
        }

        // Is a target provided?
        var target = _s.trim(command.replace(/^!p(i|o)ng (.*?)$/, '$2'));
        if (data.players.indexOf(target) === -1) {
            callBack(from + ", " + target + " is not in the game. You are out of the game and lost a point in the rankings.");
            this.kickUser(channel, from, callBack);
            this.setScore(channel, from, -1);
            return;
        }

        // Are we pinging or ponging?
        var io = _s.trim(command.replace(/^!p(i|o)ng (.*?)$/, '$1'));
        if (!((data.ping && io === 'i') || (!data.ping && io === 'o'))) {
            callBack(from + ": it was time for a p" + (data.ping ? 'i' : 'o') + "ng. You are out of the game and lost a point in the rankings.");
            this.kickUser(channel, from, callBack);
            this.setScore(channel, from, -1);
            return;
        }

        // Correct, move the ball
        data.ball = target;
        data.ping = !data.ping;
        this.setGameData(channel, data);
        this.setBallTimeout(channel, callBack);
        callBack(data.ball + " has the ball");

    }


    /**
     *  Get the data for the current game in this channel
     */
    static getGameData(channel) {
        var data = Cache.instance.get("pingpong", {}) || {};
        if (data.hasOwnProperty(channel) && data[channel] !== null) {
            return data[channel];
        } else {
            data[channel] = {
                ball: null,
                ping: true,
                players: [],
                status: null
            };
            Cache.instance.rememberForever("pingpong", () => data);
            return data[channel];
        }
    }


    /**
     *  Display the score for this channel
     */
    static getScore(channel, callBack) {
        this._getScore(channel, (data) => {
            var str = "PingPong score: ";
		    for (var user in data)
		        str += user + ": " + data[user] + " | ";

		    callBack(str);
        });
    }
    static _getScore(channel, callBack) {
        fs.readFile(file, function (err, data) {
            if (err) {
                data = "{}";
			}

			data = JSON.parse(data);

            if (channel) {
    			if (data.hasOwnProperty(channel)) {
    			    callBack(data[channel]);
    			} else {
    			    callBack({});
    			}
            } else {
                callBack(data);
            }
        });
    }


    /**
     *  Join a game currently in progress
     */
    static joinGame(from, channel, callBack) {

        var data = this.getGameData(channel);
        if (data.status !== "joining")
            return;

        // Don't add players twice
        if (data.players.indexOf(from) > -1)
        {
            callBack(from + " you are already in the game, wait for the game to start");
            return;
        }
        else
        {
            data.players.push(from);
            this.setGameData(channel, data);
            callBack(from + " has joined the pingpong game!");
        }

    }


    /**
     *  Throw a user out of the game
     */
    static kickUser(channel, from, callBack) {
        var data = this.getGameData(channel);

        // Remove user
        data.players = _.without(data.players, from);

        // If only one player is left, the game has ended
        if (data.players.length === 1) {
            try { clearTimeout(PingPong.ballTimeout) } catch (e) {}

            // Set the winner
            this.setScore(channel, data.players[0], 1);
            callBack(data.players[0] + " is the last player in the game and has won the game!");

            // Stop the game
            this.setGameData(channel, null);

            return;
        }

        // Pass the ball
        data.ball = _.sample(data.players);
        this.setBallTimeout(channel, callBack);
        callBack(data.ball + " has the ball now!");

        // Save the new data
        this.setGameData(channel, data);
    }


    /**
     *  Set a timeout to make sure a user doesn't have the ball for too long
     */
    static setBallTimeout(channel, callBack) {
        try { clearTimeout(PingPong.ballTimeout) } catch (e) {}

        PingPong.ballTimeout = setTimeout(() => {
            let data = PingPong.getGameData(channel);
            let user = data.ball;

            callBack(user + " has had the ball for too long and is out of the game!");
            this.kickUser(channel, user, callBack);
            this.setScore(channel, user, -1);
        }, 3e4);
    }


    /**
     *  Update the game data for a channel
     */
    static setGameData(channel, chdata) {
        let data = Cache.instance.get("pingpong", {});
        data[channel] = chdata;
        Cache.instance.put("pingpong", -1, data);
    }


    /**
     *  Set the score for a specific user in this channel
     */
    static setScore(channel, user, diff) {
        this._getScore(null, (data) => {

            if (!data.hasOwnProperty(channel))
                data[channel] = {};

            if (!data[channel].hasOwnProperty(user))
                data[channel][user] = 0;

            data[channel][user] += diff;

            fs.writeFile(file, JSON.stringify(data));
        });
    }


    /**
     *  Start a new game
     */
    static startGame(from, channel, callBack) {

        var data = this.getGameData(channel);

        // Make sure there is no other game in progress
        if (data.status) {
            callBack(from + ": A game is already in progress, wait for this game to end.");
            return;
        }

        // Enable joining
        data.status = 'joining';
        data.players = [from];
        this.setGameData(channel, data);

        // Set a timer for when joining ends
        setTimeout(() => {
            PingPong.startPlaying(channel, callBack);
        }, 6e4);

        // Let the users know a game is starting
        callBack(from + " started a new pingpong game, use !join to join this game.");
    }


    /**
     *  The game is ready, lets throw the ball
     */
    static startPlaying(channel, callBack) {

        // Count the players
        var data = this.getGameData(channel);
        if (data.players.length < 2) {

            // Let the users know
            callBack("Only " + data.players.length + " player has joined, the game is canceled");

            // Cancel the game
            this.setGameData(channel, null);

            return;
        }

        // Set the status of the game
        data.status = 'playing';
        data.ball = _.sample(data.players);
        this.setGameData(channel, data);

        // Let the players know
        callBack("It's go time, we are playing pingpong with " + data.players.join(", ") + ".");

        // Throw the ball to the first player
        callBack(data.ball + " has the ball, what will he do next? (!ping %user%, !pong %user%)");

        // Set the balltimeout
        this.setBallTimeout(channel, callBack);
    }
}
