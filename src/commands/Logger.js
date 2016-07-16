var fs = require("fs");
var mysql = require("mysql");

import Cache from '../common/Cache.js';
import Log from '../common/Log.js';

export default class Logger {

    static catchAll(from, to, message) {

        // Get database info
        fs.readFile(__dirname + "/../data/logger.json", function (err, data) {
            if (err) {
                console.log("Error reading logger.json: " + err);
                return;
            }

            // Create mysql connection
            var config = JSON.parse(data);
            let connection = mysql.createConnection(config.db);
            connection.connect();

            // Insert the message
            connection.query(
                "INSERT INTO messages (channel, user, message) VALUES (?, ?, ?)",
                [
                    to,
                    from,
                    message
                ]
            );

            // Close the connection
            connection.end();


        });

    }

    static log(msg) {
        Log.log("[Logger] " + msg);
    }

}