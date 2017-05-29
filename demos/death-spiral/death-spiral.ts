var death_spiral: any[] = [
    { // Update settings and first statement
        code: function (r, d) {
            r.settings.noAutoSave = true;
            //r.settings.hideScore = true;
            //r.settings.hidePoints = true;
            //r.settings.showSiblings = true;
            r.settings.hideClaimMenu = true;
            //r.settings.hideChildIndicator = true;

            r.selectedScore = r.mainScore;
            r.mainScore.claim.content = ""
            r.calculate();
            return { score: r.mainScore, content: "'Obamacare is in a death spiral' - Hugh Hewitt on Meet the Press, March 26, 2017." }
        }, delay: 3000
    }, {
        code: (r, d) => {
            d.addClaim("ORANGE claims REDUCE the confidence.", false)
            r.calculate();
        }, delay: 3000
    }, {
        code: (r, d) => {
            d.addClaim("PURPLE claims INCREASE the confidence.", true)
        }, delay: 1000
    }
];