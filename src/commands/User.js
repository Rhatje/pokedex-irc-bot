import Channel from '../common/Channel.js';

/**
 * Simple command that displays users in the channel.
 * Only for testing purposes...
 */
export default class Users {

    static doCommand(command, from, to, callBack) {
        if (typeof callBack !== "function")
            callBack = (msg) => {};

        if (command === "!random")
        {
            var users = Channel.instance.get(to).users;
            if (users.length === 0)
                callBack(from);

	        callBack(users[Math.floor(Math.random() * users.length)]);
        }
        else if (command === "!users")
        {
	        callBack(Channel.instance.get(to).users.join(", "));
        }

    }

    static getCommands() {
    	return [
    	    "!randomuser",
    	    "!users"
    	];
    }

}
