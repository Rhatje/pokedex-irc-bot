import Channel from '../common/Channel.js';

/**
 * Simple command that displays users in the channel.
 * Only for testing purposes...
 */
export default class Users {
	
    static doCommand(command, from, to, callBack) {

	callBack(Channel.instance.get(to).users.join(", "));

    }

    static getCommands() {
	return [
	    "!users"
	];
    }

}
