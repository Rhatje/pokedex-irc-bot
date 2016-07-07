export default class Log {

    /**
     *  Send logging to the stdout
     */
    static log(message, user) {
        let date = new Date();

        console.log(
            "[" + 
	    date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).substring(0, 2) + "-" + ("0" + date.getDate()).substring(0, 2) +
	    " " +
	    date.getHours() + ":" + date.getMinutes() +
	    "] " +
            message + 
	    (user ? " (" + user + ")" : "")
        );
    }

}
