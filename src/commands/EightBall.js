import Cache from '../common/Cache.js';

export default class EightBall {

    static doCommand(msg, from, to, callBack) {

        callBack(
            Cache.instance.remember("eightball_" + encodeURI(msg), 15, function () {

                var responses = [
                    "Ja",
                    "Ja!",
                    "Misschien ooit eens...",
                    "Natuurlijk",
                    "Natuurlijk!",
                    "Natuurlijk niet",
                    "Natuurlijk niet!",
                    "Nee",
                    "Nee!"
                ];

                return responses[Math.floor(Math.random() * responses.length)];

            })
        );

    }

    static getCommands() {
        return [
            "^!kan ",
            "^!heeft ",
            "^!is ",
            "^!moet ",
            "^!wil ",
            "^!zal ",
            "^!zou "
        ]
    }

}
