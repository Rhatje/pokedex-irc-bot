//const rio2016 = require( 'rio2016' );

import Cache from '../common/Cache.js';
import Config from '../config.js';
import Log from '../common/Log.js';

/**
 * This class keeps track of the 2016 olympics in rio and lets us know when
 * Belgium receives a medal.
 */
export default class Rio2016 {

    static doCommand(msg, from, to, callBack) {

        // Count belgian medals
        if (msg === '!medals') {

            // Olympics over, add static message
            callBack("Rio2016 Belgium medals: 2 gold, 2 silver, 2 bronze");

            // var doCallBack = (medals) => {
            //     callBack(
            //         "Rio2016 Belgium medals: " +
            //         medals.gold + " gold, " +
            //         medals.silver + " silver, " +
            //         medals.bronze + " bronze"
            //     );
            // };

            // var medals = JSON.parse(Cache.instance.get('rio2016medals'));
            // if (!medals) {
            //     this.getBelgianMedals(doCallBack);
            // } else {
            //     doCallBack(medals);
            // }
        }

    }


    /**
     *  Find new medals for the first time, so we don't output all of them with
     *  every reboot.
     */
    // static init() {
    //     this.getBelgianMedals((medals) => {
    //         Cache.instance.put('rio2016medals', -1, JSON.stringify(medals));
    //     });
    // }

    /**
     *  Find out of new medals have been earned
     */
    // static minuteInvoke(callBack) {

    //     this.getBelgianMedals((medals) => {

    //         // Get medal objects from cache
    //         var medalsCache = JSON.parse(Cache.instance.get('rio2016medals'));

    //         // Compare values and create messages
    //         var msg = '';
    //         if (medals.gold > medalsCache.gold) {
    //             msg = 'Belgium just won another golden medal in Rio!!!';
    //         }
    //         else if (medals.silver > medalsCache.silver) {
    //             msg = 'Belgium just won another silver medal in Rio!!';
    //         }
    //         else if (medals.bronze > medalsCache.bronze) {
    //             msg = 'Belgium just won another bronze medal in Rio!';
    //         }

    //         if (msg.length > 0) {

    //             Rio2016.log(msg);
    //             Cache.instance.put('rio2016medals', -1, JSON.stringify(medals));

    //             for (var i in Config.irc.channels) {
    //                 callBack(Config.irc.channels[i], msg);
    //             }
    //         }

    //     });

    // }


    // static getBelgianMedals(callBack) {
    //     rio2016.medal('BEL', 'en', (medals) => {
    //         callBack(JSON.parse(medals));
    //     });
    // }


    static getCommands() {
        return [
            '^!medals'
        ];
    }

    static log(msg) {
        Log.log("[Logger] " + msg);
    }

}
