class Demo {
    constructor(rrDisplay) {
        this.speed = .5;
        this.currentActId = 0;
        this.bag = {};
        this.script = [
            {
                delay: 0,
                code: function (r) {
                    r.settings.noAutoSave = true;
                    r.settings.hideScore = true;
                    r.settings.hidePoints = true;
                    r.settings.showSiblings = true;
                    r.settings.hideClaimMenu = true;
                    r.settings.hideChildIndicator = true;
                    r.selectedScore = r.mainScore;
                    r.mainScore.claim.content = "";
                }
            }, {
                delay: 1000,
                code: (r) => {
                    r.mainScore.claim.content = "How confdient are we?";
                }
            }, {
                delay: 1000,
                code: (r) => {
                    this.addClaim("It is true because...", true);
                }
            }, {
                delay: 1000,
                code: (r) => {
                    this.addClaim("It is false because...", false);
                }
            }, {
                delay: 1000,
                code: (r) => {
                    r.calculate();
                    r.settings.hideScore = false;
                }
            }, {
                delay: 1000,
                code: (r) => {
                    this.bag.c3 = this.addClaim("Here is another reason it could be false...", true);
                }
            }, {
                delay: 1000,
                code: (r) => {
                    r.calculate();
                    r.settings.hideScore = false;
                }
            }, {
                delay: 1000,
                code: (r) => {
                    r.selectedScore = this.bag.c3;
                    r.setDisplayState();
                    this.addClaim("Blue Team says this claim is false because..", true, this.bag.c3);
                    this.addClaim("Orange Team says this claim is false because..", false, this.bag.c3);
                }
            }, {
                delay: 1000,
                code: (r) => {
                    r.calculate();
                    r.settings.hideScore = false;
                }
            }, {
                delay: 1000,
                code: (r) => {
                    r.settings.hidePoints = false;
                }
            }, {
                delay: 1000,
                code: (r) => {
                    r.settings.hideClaimMenu = false;
                    r.settings.hideChildIndicator = false;
                    r.settings.showSiblings = false;
                    r.selectedScore = r.mainScore;
                    r.setDisplayState();
                }
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
        let act = this.script[this.currentActId];
        act.code.bind(this, this.rr)();
        this.rr.update();
        this.currentActId++;
        let nextAct = this.script[this.currentActId];
        if (nextAct)
            setTimeout(this.runCurrentAct.bind(this), nextAct.delay / this.speed);
    }
}
//# sourceMappingURL=Demo.js.map