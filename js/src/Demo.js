var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Demo {
    constructor(rrDisplay) {
        this.speed = 1;
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
    wait(milliseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                setTimeout(resolve, milliseconds / this.speed);
            });
        });
    }
    run(rrDisplay) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = this.rr;
            r.settings.noAutoSave = true;
            r.settings.hideScore = true;
            r.settings.hidePoints = true;
            r.settings.showSiblings = true;
            r.settings.hideClaimMenu = true;
            r.settings.hideChildIndicator = true;
            r.mainScore.claim.content = "How confdient are we?";
            r.selectedScore = r.mainScore;
            r.update();
            yield this.wait(1000);
            r.setDisplayState();
            r.update();
            //Add two statements
            yield this.wait(1000);
            this.addClaim("It is true because...", true);
            yield this.wait(1000);
            this.addClaim("It is false because...", false);
            yield this.wait(1000);
            r.calculate();
            r.settings.hideScore = false;
            r.update();
            yield this.wait(1000);
            //r.settings.hideScore = true;
            r.update();
            yield this.wait(1000);
            //Add a third Claim
            let c3 = this.addClaim("Here is another reason it could be false...", true);
            yield this.wait(1000);
            r.calculate();
            r.settings.hideScore = false;
            r.update();
            //Make the last claim 50% confident
            yield this.wait(1000);
            r.selectedScore = c3;
            r.setDisplayState();
            this.addClaim("The blue side says this claim is false because..", true, c3);
            this.addClaim("The orange side says this claim is false because..", false, c3);
            r.update();
            //Show what happens
            yield this.wait(1000);
            r.calculate();
            r.update();
            //show points
            yield this.wait(1000);
            r.settings.hidePoints = false;
            r.update();
            //set it so they can edit
            yield this.wait(1000);
            r.settings.hideClaimMenu = false;
            r.settings.hideChildIndicator = false;
            r.settings.showSiblings = false;
            r.selectedScore = r.mainScore;
            r.setDisplayState();
            r.update();
        });
    }
}
//# sourceMappingURL=Demo.js.map