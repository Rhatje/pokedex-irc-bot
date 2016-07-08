export default class Log {

    /**
     *  Send logging to the stdout
     */
    static log(message, user) {
        let date = new Date();

        console.log(
            "[" +
    	    date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) +
    	    " " +
    	    ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) +
    	    "] " +
            message +
	        (user ? " (" + user + ")" : "")
        );
    }

}
