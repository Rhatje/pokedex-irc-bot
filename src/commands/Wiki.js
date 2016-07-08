const wikijs = require('wikipedia-js');

import Cache from '../common/Cache.js';
import Log from '../common/Log.js';

/**
 *  !wiki - Get information from a wiki page about a certain subject
 */
export default class Wiki {

    static doCommand(command, from, to, callBack) {

        // Remove the '!wiki' and trim white spaces
        command = command.replace(/^!wiki/, "").trim();

        // Do we have this command in cache?
        var wiki = Cache.instance.get("wiki_" + encodeURI(command));
        if (wiki) {
            Log.log("[Wiki] " + from + " looked up '" + command + "' (cache)");
            callBack(wiki);
            return;
        }

        // Start a wiki search
        let options = {
    		query: command,
    		format: 'html',
    		summaryOnly: true
        };
        wikijs.searchArticle(options, function (err, wikiText) {
            if (err)
            {
                this.log("[Wiki] error: " + err, from);
            }

            if (wikiText !== null)
            {
                let result = wikiText.match(/<p>.*?<\/p>/);
                let w;
                if (result) {
                    w = result[0];
                } else {
                    w = "";
                }

                // Add the pages this wiki may refer to.
                if (w.indexOf("may refer to") > 0)
                {
                    wikiText = wikiText.replace(/\n/g, "").replace(/\r/g, "");

                    result = wikiText.match(/<ul>.*(<\/ul>)?/mi);
                    if (result !== null)
                    {
                        var l = result[0].split("</li>");

                        var c = 0;
                        for (var li in l)
                        {
                            if (c > 0)
                                w += ",";

                            li = l[li].split(",");
                            li = li[0];
                            w += " " + li;

                            c++;
                        }
                    }
                }
                w = w.replace(/<.*?>/g, '');
                w = w.replace(/\[.*?\]/g, '');
                w = w.replace(/\s+/, ' ');

                // Trim the result
                if (w.length > 350)
                    w = w.substr(0, 350) + "...";

                // Save the result in cache
                Cache.instance.put("wiki_" + encodeURI(command), 1440, w);

                // Call the callback
		        Log.log("[Wiki] " + from + " looked up '" + command + "'");
                if (typeof callBack === 'function') {
                    callBack(w);
                }
            }
            else
            {
               	Log.log("[Wiki] " + from + " tried looking for '" + command + "', nothing was found...");
            }
        });

    };

    static getCommands() {
        return ["^!wiki"];
    };

}
