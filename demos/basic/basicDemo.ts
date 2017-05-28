    var basicDemo: any[] = [
        { // Update settings and first statement
            code: function (r,d) {
                r.settings.noAutoSave = true;
                r.settings.hideScore = true;
                r.settings.hidePoints = true;
                r.settings.showSiblings = true;
                r.settings.hideClaimMenu = true;
                r.settings.hideChildIndicator = true;

                r.selectedScore = r.mainScore;
                r.mainScore.claim.content = ""
            }, delay: 0
        }, {
            code: (r,d) => {
                return { score: r.mainScore, content: "This is MAIN CLAIM we will be measuring the confidence on." }
            }, delay: 3000
        }, {
            code: (r,d) => {
                return { score: r.mainScore, content: "This is MAIN CLAIM wel will be measuring the confidence on. We assume 100% confidence to start." }
            }, delay: 2000
        }, {
            code: (r,d) => {
                r.calculate();
                r.settings.hideScore = false;
            }, delay: 1000
        }, {
            code: (r,d) => {
                d.addClaim("ORANGE claims REDUCE the confidence.", false).weightDif = 1;
            }, delay: 2000
        }, {
            code: (r,d) => {
                r.calculate();
            }, delay: 2000
        }, {
            code: (r,d) => {
                d.addClaim("BLUE claims INCREASE the confidence.", true).weightDif = 1;
            }, delay: 1000
        }, {
            code: (r,d) => {
                r.calculate();
            }, delay: 2000
        }, {
            code: (r,d) => {
                d.bag.s3 = d.addClaim("What if we add another reason it could be true?", true);
                d.bag.s3.weightDif = 1;
            }, delay: 1000
        }, {
            code: (r,d) => {
                r.mainScore.claim.content = "";
                return { score: r.mainScore, content: "What do you expect the confidence percentage to be now?" }
            }, delay: 2000
        }, {
            code: (r,d) => {
                r.calculate();
            }, delay: 1000
        }, {
            code: (r,d) => {
                r.selectedScore = d.bag.s3;
                r.setDisplayState();
                d.addClaim("and a reason it may be false..", false, d.bag.s3).weightDif = 1;
                d.addClaim("What if we add a reason it may be true..", true, d.bag.s3).weightDif = 1;
            }, delay: 1000
        }, {
            code: (r: RRDisplay, d) => {
                //d.bag.s3.claim.content = "";
                d.bag.s3.weightDif = 0;
                return { score: d.bag.s3, content: "This claim becomes undecided." }
                //return { score: d.bag.s3, content: "This statement becomes undecided so it is worth zero points." }
            }, delay: 2000
        }, {
            code: (r,d) => {
                r.calculate();
            }, delay: 1000
        }, {
            code: (r,d) => {
                d.addClaim("Let's add one more reason it may be true", true, d.bag.s3).weightDif = 1;
            }, delay: 1000
        }, {
            code: (r: RRDisplay, d) => {
                d.bag.s3.claim.content = "This claim";
                d.bag.s3.weightDif = 1;
                return { score: d.bag.s3, content: "This claim now has more reasons to be true." }

                //return { score: this.bag.s3, content: "Now this statement has 2 blue points minus 1 orange point so the total is 1 point." }
            }, delay: 2000
        }, {
            code: (r,d) => {
                r.calculate();
            }, delay: 1000
        }
        , {//Set everything back to normal
            code: (r,d) => {
                r.settings.hideClaimMenu = false;
                r.settings.hideChildIndicator = false;
                r.settings.showSiblings = false;
                r.settings.hidePoints = false;
                r.selectedScore = r.mainScore;
                r.setDisplayState();
            }, delay: 1000
        }
    ];