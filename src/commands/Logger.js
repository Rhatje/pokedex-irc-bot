var fs = require("fs");
var mysql = require("mysql");

import Log from '../common/Log.js';

export default class Logger {

    static catchAll(from, to, message, raw) {

        // Get database info
        fs.readFile(__dirname + "/../data/logger.json", function (err, data) {
            if (err) {
                console.log("Error reading logger.json: " + err);
                return;
            }

            // No raw data, no log
            if (!raw) {
                return;
            }

            // Create mysql connection
            var config = JSON.parse(data);
            let connection = mysql.createConnection(config.db);
            connection.connect();

            // Get channel info and insert the message
            Logger._getChannelAndUser(connection, raw, to, (userid) => {

                connection.query(
                    "INSERT INTO messages SET ?",
                    {
                        channel: to,
                        nickname: from,
                        user_id: userid,
                        message: message
                    },
                    () => {
                        connection.end();
                    }
                );

            });

        });

    }

    static doKick(channel, nick, by, reason, raw) {

        // Get database info
        fs.readFile(__dirname + "/../data/logger.json", function (err, data) {
            if (err) {
                console.log("Error reading logger.json: " + err);
                return;
            }

            // No raw data, no log
            if (!raw) {
                return;
            }

            // Create mysql connection
            var config = JSON.parse(data);
            let connection = mysql.createConnection(config.db);
            connection.connect();

            // Get channel info and insert the message
            Logger._getChannelAndUser(connection, raw, channel, (userid) => {

                connection.query(
                    "INSERT INTO kicks SET ?",
                    {
                        target_nick: nick,
                        kicker_id: userid,
                        kicker_nick: by,
                        reason: reason,
                        channel: channel
                    },
                    () => {
                        connection.end();
                    }
                );

            });

        });

    }

    static doTopic(channel, topic, nick, raw) {

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

            // Get channel info and insert the message
            Logger._getChannelAndUser(connection, raw, channel, (userid) => {

                connection.query(
                    "INSERT INTO topics SET ?",
                    {
                        channel: channel,
                        topic: topic,
                        user_id: userid
                    },
                    () => {
                        connection.end();
                    }
                );

            });

        });

    }

    static log(msg) {
        Log.log("[Logger] " + msg);
    }

    /**
     *  Make sure the channel exists in the database and get the user id
     */
    static _getChannelAndUser(connection, raw, to, callBack) {
        console.log(raw);

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
                                            callBack(result.insertId);
                                        }
                                    );
                                } else {
                                    callBack(rows[0]["id"]);
                                }
                            }
                        );

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

    }
}