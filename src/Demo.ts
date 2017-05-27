class Demo {
    rr: RRDisplay;

    constructor(rrDisplay?: RRDisplay) {
        this.rr = rrDisplay
    }

    async addClaim(content: string, isProMain: boolean = true): Promise<Score> {
        ///rr.addClaim(rr.mainScore, false)
        let newClaim: Claim = new Claim();
        newClaim.content = content;
        newClaim.isProMain = isProMain;
        let newScore: Score = new Score(newClaim)
        this.rr.scoresDict[newClaim.id] = newScore;
        this.rr.mainScore.claim.childIds.unshift(newClaim.id);
        this.rr.claimsList.push(newScore.claim);
        newScore.displayState = "newClaim";
        this.rr.update();

        await this.wait(20);
        //this.rr.selectedScore = newScore;
        //this.rr.calculate();
        this.rr.setDisplayState();
        // newScore.displayState = "newClaim";
        this.rr.update();
        return newScore;
    }

    async wait(milliseconds: number) {
        return new Promise<void>(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    async run(rrDisplay?: RRDisplay) {
        let r = this.rr
        r.settings.noAutoSave = true;
        r.settings.hideScore = true;
        r.mainScore.claim.content = "How confdient are whe in the statement?"
        r.selectedScore = r.mainScore;
        r.update();

        await this.wait(1000);
        r.setDisplayState();
        r.update();

        //Add two statements
        await this.wait(1000);
        this.addClaim("It is true because...", true)
        await this.wait(1000);
        this.addClaim("It is false because...", false)
        await this.wait(1000);
        r.calculate();
        r.settings.hideScore = false;
        r.update();
        await this.wait(1000);
        //r.settings.hideScore = true;
        r.update();
        await this.wait(1000);

        //Add a third Claim
        this.addClaim("Here is another reason it could be false...", true)
        //await this.wait(1000);
        await this.wait(1000);
        r.calculate();

        r.settings.hideScore = false;
        r.update();
    }

}

