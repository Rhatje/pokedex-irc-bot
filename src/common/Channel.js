export default class Channel {
    channelObj = null;
    channels = {};

    /**
     *	Get the available instance for this class
     */
    static get instance() {
    	if (this.channelObj === null || this.channelObj === undefined) {
    	    this.channelObj = new Channel();
    	}

    	return this.channelObj;
    }


    constructor() {
	    this.channels = {};
    }

    /**
     *	Get an instance for a specific channel
     */
    get(channel) {
    	if (this.channels.hasOwnProperty(channel))
    	    return this.channels[channel];
     	else
    	    return {users:[]};
    }


    /**
     *	Set data for this channel
     */
    set(channel, data) {
	    this.channels[channel] = data;
    }

}
