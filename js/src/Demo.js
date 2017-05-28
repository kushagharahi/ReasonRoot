class Demo {
    constructor(rrDisplay) {
        this.speed = 1;
        this.script = [
            {
                delay: 3000,
                code: function (r) {
                    this.rr.settings.noAutoSave = true;
                    this.rr.settings.hideScore = true;
                    this.rr.settings.hidePoints = true;
                    this.rr.settings.showSiblings = true;
                    this.rr.settings.hideClaimMenu = true;
                    this.rr.settings.hideChildIndicator = true;
                    this.rr.mainScore.claim.content = "How confdient are we?...";
                    this.rr.selectedScore = this.rr.mainScore;
                    this.rr.update();
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
        //await this.wait(20);
        setTimeout(() => {
            //this.rr.selectedScore = newScore;
            //this.rr.calculate();
            this.rr.setDisplayState();
            // newScore.displayState = "newClaim";
            this.rr.update();
        }, 20);
        return newScore;
    }
    run(rrDisplay) {
        for (let act of this.script) {
            setTimeout(act.code.bind(this, this.rr), act.delay);
        }
    }
}
//# sourceMappingURL=Demo.js.map