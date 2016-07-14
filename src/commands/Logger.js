var fs = require("fs");
var mysql = require("mysql");

import Cache from '../common/Cache.js';
import Log from '../common/Log.js';

export default class Logger {

    static catchAll(from, to, message) {

        // Get the connection object
        let connection = Cache.instance.get("logger_connection");

        // Insert the message
        connection.query(
            "INSERT INTO messages (channel, user, message) VALUES (?, ?, ?)",
            [
                to,
                from,
                message
            ]
        );

    }

    static init() {

        fs.readFile(__dirname + "/../data/logger.json", function (err, data) {
            if (err) {
                console.log("Error reading logger.json: " + err);
                return;
            }

            // Create mysql connection
            var config = JSON.parse(data);
            let connection = mysql.createConnection({
                socketPath: config.db.socket,
                user: config.db.username,
                password: config.db.password,
                database: config.db.database
            });
            connection.connect();
            Cache.instance.put(
                "logger_connection",
                -1,
                connection
            );

        });

    }

    static log(msg) {
        Log.log("[Logger] " + msg);
    }

}