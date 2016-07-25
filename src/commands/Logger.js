var fs = require("fs");
var mysql = require("mysql");

import Cache from '../common/Cache.js';
import Log from '../common/Log.js';

export default class Logger {

    static catchAll(from, to, message, raw) {
        console.log(raw);

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

            // Find the channel in the db
            connection.query(
                "SELECT name FROM channels WHERE name = ?",
                [to],
                (err, rows) => {
                    if (err) {
                        Log.log("mysql error: " + err);
                        return;
                    }

                    // Function to get the user once we have the channel
                    var getUser = function (channel) {

                        connection.query(
                            "SELECT id FROM users WHERE name = ? AND host = ?",
                            [ raw.user, raw.host ],
                            (err, rows) => {
                                if (err) {
                                    Log.log("mysql error: " + err);
                                    return;
                                }

                                var insertMessage = (channel, user, nick, message) => {

                                    connection.query(
                                        "INSERT INTO messages SET ?",
                                        {
                                            channel: channel,
                                            nickname: nick,
                                            user_id: user,
                                            message: message
                                        },
                                        () => {
                                            connection.end();
                                        }
                                    );

                                };

                                // New user?
                                if (rows.length === 0) {
                                    connection.query(
                                        "INSERT INTO users SET ?",
                                        {
                                            name: raw.user,
                                            host: raw.host
                                        },
                                        (err, result) => {
                                            if (err) {
                                                Log.log('User insert error: ' + err);
                                                return;
                                            }

                                            // Insert worked, get the user info
                                            insertMessage(channel, result.insertId, from, message);
                                        }
                                    );
                                } else {
                                    insertMessage(channel, rows[0]["id"], from, message);
                                }
                            }
                        )

                    };

                    // The channel has to be created
                    if (rows.length === 0) {
                        connection.query(
                            "INSERT INTO channels SET ?",
                            { name: to },
                            (err, result) => {
                                if (err) {
                                    Log.log('Channel insert error: ' + err);
                                    return;
                                }

                                // Insert worked, get the user info
                                getUser(to);
                            }
                        );
                    } else {
                        getUser(to);
                    }
                }
            );

            // Insert the message
            // connection.query(
            //     "INSERT INTO messages (channel, user, message) VALUES (?, ?, ?)",
            //     [
            //         to,
            //         from,
            //         message
            //     ]
            // );

            // Close the connection
            //connection.end();


        });

    }

    static log(msg) {
        Log.log("[Logger] " + msg);
    }

}