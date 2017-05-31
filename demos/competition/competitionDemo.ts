var competitionDemo: any[] = [
    { // Update settings and first statement
        code: function (r, d) {
            r.settings.noAutoSave = true;
            r.settings.hideScore = true;
            r.settings.hidePoints = true;
            r.settings.showSiblings = true;
            r.settings.hideClaimMenu = true;
            r.settings.hideChildIndicator = true;
            r.settings.showCompetition = true;

            r.selectedScore = r.mainScore;
            r.mainScore.claim.content = ""
        }, delay: 1000
    }, {
        code: (r, d) => {
            return { score: r.mainScore, content: "This is MAIN CLAIM we will be competing over." }
        }, delay: 3000
    }, {
        code: (r, d) => {
            return { score: r.mainScore, content: "This is MAIN CLAIM we will be competing over. We assume 1 point for the purple team to start." }
        }, delay: 2000
    }, {
        code: (r, d) => {
            r.calculate();
            //r.settings.hideScore = false;
        }, delay: 1000
    }, {
        code: (r, d) => {
            d.addClaim("ORANGE claims DISPUTE the main claim and give points to the orange team.", false).weightDif = 1;
            r.calculate();
        }, delay: 2000
    }, {
        code: (r, d) => {
            d.addClaim("PURPLE claims SUPPORT the main claim and give points to the orange team.", true).weightDif = 1;
            r.calculate();
        }, delay: 1000
    }, {
        code: (r, d) => {
            d.bag.s3 = d.addClaim("What if we add another reason it could be true?", true);
            r.calculate();
        }, delay: 1000
    }, {
        code: (r, d) => {
            r.selectedScore = d.bag.s3;
            r.setDisplayState();
            d.addClaim("and a reason it may be false..", false, d.bag.s3).weightDif = 1;
            d.addClaim("What if we add a reason it may be true..", true, d.bag.s3).weightDif = 1;
            r.calculate();
        }, delay: 1000
    }, {
        code: (r, d) => {
            d.addClaim("Let's add one more reason it may be true", true, d.bag.s3).weightDif = 1;
            r.calculate();
        }, delay: 1000
    }, {
        code: (r: RRDisplay, d) => {
            d.bag.s3.claim.content = "This claim";
            d.bag.s3.weightDif = 1;
            r.calculate();
            return { score: d.bag.s3, content: "This claim now has more reasons to be true." }
        }, delay: 2000
    }, {
        code: (r, d) => {
            r.mainScore.claim.content = "";
            return { score: r.mainScore, content: "Now you can try it!" }
        }, delay: 500
    }
    , {//Set everything back to normal
        code: (r, d) => {
            r.settings.hideClaimMenu = false;
            r.settings.hideChildIndicator = false;
            r.settings.showSiblings = false;
            //r.settings.hidePoints = false;
            r.selectedScore = r.mainScore;
            r.setDisplayState();
        }, delay: 0
    }
];