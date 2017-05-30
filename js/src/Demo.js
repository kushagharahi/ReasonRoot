class Demo {
    constructor() {
        this.speed = .5;
        this.currentActId = 0;
        this.bag = {};
        //          , {
        //             code: (r) => {
        //             }, delay: 1000
        //         }
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
    run(rrDisplay, script) {
        this.rr = rrDisplay;
        this.script = script;
        this.runCurrentAct.bind(this)();
    }
    runCurrentAct() {
        let position = 0;
        let act = this.script[this.currentActId];
        let write = act.code(this.rr, this);
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