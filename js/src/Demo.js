class Demo {
    constructor(rrDisplay) {
        this.speed = .5;
        this.currentActId = 0;
        this.bag = {};
        this.script = [
            {
                code: function (r) {
                    r.settings.noAutoSave = true;
                    r.settings.hideScore = true;
                    r.settings.hidePoints = true;
                    r.settings.showSiblings = true;
                    r.settings.hideClaimMenu = true;
                    r.settings.hideChildIndicator = true;
                    r.selectedScore = r.mainScore;
                    r.mainScore.claim.content = "";
                }, delay: 0
            }, {
                code: (r) => {
                    return { score: r.mainScore, content: "This is MAIN CLAIM we will be measuring the confidence on." };
                }, delay: 3000
            }, {
                code: (r) => {
                    return { score: r.mainScore, content: "This is MAIN CLAIM wel will be measuring the confidence on. We assume 100% confidence to start." };
                }, delay: 2000
            }, {
                code: (r) => {
                    r.calculate();
                    r.settings.hideScore = false;
                }, delay: 1000
            }, {
                code: (r) => {
                    this.addClaim("ORANGE claims REDUCE the confidence.", false).weightDif = 1;
                }, delay: 2000
            }, {
                code: (r) => {
                    r.calculate();
                }, delay: 2000
            }, {
                code: (r) => {
                    this.addClaim("BLUE claims INCREASE the confidence.", true).weightDif = 1;
                }, delay: 1000
            }, {
                code: (r) => {
                    r.calculate();
                }, delay: 2000
            }, {
                code: (r) => {
                    this.bag.s3 = this.addClaim("What if we add another reason it could be true?", true);
                    this.bag.s3.weightDif = 1;
                }, delay: 1000
            }, {
                code: (r) => {
                    r.mainScore.claim.content = "";
                    return { score: r.mainScore, content: "What do you expect the confidence percentage to be now?" };
                }, delay: 2000
            }, {
                code: (r) => {
                    r.calculate();
                }, delay: 1000
            }, {
                code: (r) => {
                    r.selectedScore = this.bag.s3;
                    r.setDisplayState();
                    this.addClaim("and a reason it may be false..", false, this.bag.s3).weightDif = 1;
                    this.addClaim("What if we add a reason it may be true..", true, this.bag.s3).weightDif = 1;
                }, delay: 1000
            }, {
                code: (r) => {
                    //this.bag.s3.claim.content = "";
                    this.bag.s3.weightDif = 0;
                    return { score: this.bag.s3, content: "This claim becomes undecided." };
                    //return { score: this.bag.s3, content: "This statement becomes undecided so it is worth zero points." }
                }, delay: 2000
            }, {
                code: (r) => {
                    r.calculate();
                }, delay: 1000
            }, {
                code: (r) => {
                    this.addClaim("Let's add one more reason it may be true", true, this.bag.s3).weightDif = 1;
                }, delay: 1000
            }, {
                code: (r) => {
                    this.bag.s3.claim.content = "This claim";
                    this.bag.s3.weightDif = 1;
                    return { score: this.bag.s3, content: "This claim now has more reasons to be true." };
                    //return { score: this.bag.s3, content: "Now this statement has 2 blue points minus 1 orange point so the total is 1 point." }
                }, delay: 2000
            }, {
                code: (r) => {
                    r.calculate();
                }, delay: 1000
            },
            {
                code: (r) => {
                    r.settings.hideClaimMenu = false;
                    r.settings.hideChildIndicator = false;
                    r.settings.showSiblings = false;
                    r.settings.hidePoints = false;
                    r.selectedScore = r.mainScore;
                    r.setDisplayState();
                }, delay: 1000
            }
        ];
        this.rr = rrDisplay;
    }
    addClaim(content, isProMain = true, parent) {
        ///rr.addClaim(rr.mainScore, false)
        if (!parent)
            parent = this.rr.mainScore;
        let newClaim = new Claim();
        newClaim.content = content;
        newClaim.isProMain = isProMain;
        let newScore = new Score(newClaim);
        this.rr.scoresDict[newClaim.id] = newScore;
        parent.claim.childIds.unshift(newClaim.id);
        this.rr.claimsList.push(newScore.claim);
        newScore.displayState = "newClaim";
        this.rr.update();
        setTimeout(() => {
            this.rr.setDisplayState();
            this.rr.update();
        }, 20);
        return newScore;
    }
    run(rrDisplay) {
        this.runCurrentAct.bind(this)();
    }
    runCurrentAct() {
        let position = 0;
        let act = this.script[this.currentActId];
        let write = act.code.bind(this, this.rr)();
        if (write) {
            this.writeClaim(write);
        }
        this.rr.update();
        this.currentActId++;
        let nextAct = this.script[this.currentActId];
        if (nextAct)
            setTimeout(this.runCurrentAct.bind(this), act.delay / this.speed);
    }
    writeClaim(write) {
        if (write.score.claim.content.length < write.content.length) {
            write.score.claim.content = write.content.substr(0, write.score.claim.content.length + 1);
            this.rr.update();
            setTimeout(this.writeClaim.bind(this, write), 20 / this.speed);
        }
    }
}
//# sourceMappingURL=Demo.js.map