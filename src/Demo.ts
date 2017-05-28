class Demo {
    rr: RRDisplay;
    speed: number = 1;

    constructor(rrDisplay?: RRDisplay) {
        this.rr = rrDisplay
    }

    addClaim(content: string, isProMain: boolean = true, parent?: Score): Score {
        ///rr.addClaim(rr.mainScore, false)
        if (!parent) parent = this.rr.mainScore;
        let newClaim: Claim = new Claim();
        newClaim.content = content;
        newClaim.isProMain = isProMain;
        let newScore: Score = new Score(newClaim)
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
        }, 20)
        return newScore;
    }

    run(rrDisplay?: RRDisplay) {
        for (let act of this.script) {
            setTimeout(
                act.code.bind(this, this.rr)
                , act.delay)
        }
    }


    script: any[] = [
        {
            delay: 3000,
            code: function (r) {
                this.rr.settings.noAutoSave = true;
                this.rr.settings.hideScore = true;
                this.rr.settings.hidePoints = true;
                this.rr.settings.showSiblings = true;
                this.rr.settings.hideClaimMenu = true;
                this.rr.settings.hideChildIndicator = true;

                this.rr.mainScore.claim.content = "How confdient are we?..."
                this.rr.selectedScore = this.rr.mainScore;
                this.rr.update();
            }
        }
    ];
    // async run(rrDisplay?: RRDisplay) {
    //     let r = this.rr
    //     r.settings.noAutoSave = true;
    //     r.settings.hideScore = true;
    //     r.settings.hidePoints = true;
    //     r.settings.showSiblings = true;
    //     r.settings.hideClaimMenu = true;
    //     r.settings.hideChildIndicator = true;

    //     r.mainScore.claim.content = "How confdient are we?"
    //     r.selectedScore = r.mainScore;
    //     r.update();

    //     await this.wait(1000);
    //     r.setDisplayState();
    //     r.update();

    //     //Add two statements
    //     await this.wait(1000);
    //     this.addClaim("It is true because...", true)
    //     await this.wait(1000);
    //     this.addClaim("It is false because...", false)
    //     await this.wait(1000);
    //     r.calculate();
    //     r.settings.hideScore = false;
    //     r.update();
    //     await this.wait(1000);
    //     //r.settings.hideScore = true;
    //     r.update();
    //     await this.wait(1000);

    //     //Add a third Claim
    //     let c3 = this.addClaim("Here is another reason it could be false...", true)
    //     await this.wait(1000);
    //     r.calculate();
    //     r.settings.hideScore = false;
    //     r.update();

    //     //Make the last claim 50% confident
    //     await this.wait(1000);
    //     r.selectedScore = c3;
    //     r.setDisplayState();
    //     this.addClaim("The blue side says this claim is false because..", true, c3)
    //     this.addClaim("The orange side says this claim is false because..", false, c3)
    //     r.update();

    //     //Show what happens
    //     await this.wait(1000);
    //     r.calculate();
    //     r.update();

    //     //show points
    //     await this.wait(1000);
    //     r.settings.hidePoints = false;
    //     r.update();

    //     //set it so they can edit
    //     await this.wait(1000);
    //     r.settings.hideClaimMenu = false;
    //     r.settings.hideChildIndicator = false;
    //     r.settings.showSiblings = false;
    //     r.selectedScore = r.mainScore;
    //     r.setDisplayState();
    //     r.update();

    // }

}

