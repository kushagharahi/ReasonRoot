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
        this.rr = rrDisplay;
    }
    addClaim(content, isProMain = true) {
        return __awaiter(this, void 0, void 0, function* () {
            ///rr.addClaim(rr.mainScore, false)
            let newClaim = new Claim();
            newClaim.content = content;
            newClaim.isProMain = isProMain;
            let newScore = new Score(newClaim);
            this.rr.scoresDict[newClaim.id] = newScore;
            this.rr.mainScore.claim.childIds.unshift(newClaim.id);
            this.rr.claimsList.push(newScore.claim);
            newScore.displayState = "newClaim";
            this.rr.update();
            yield this.wait(20);
            //this.rr.selectedScore = newScore;
            //this.rr.calculate();
            this.rr.setDisplayState();
            // newScore.displayState = "newClaim";
            this.rr.update();
            return newScore;
        });
    }
    wait(milliseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                setTimeout(resolve, milliseconds);
            });
        });
    }
    run(rrDisplay) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = this.rr;
            r.settings.hideScore = true;
            r.mainScore.claim.content = "How confdient are whe in the statement?";
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
            this.addClaim("Here is another reason it could be false...", true);
            //await this.wait(1000);
            yield this.wait(1000);
            r.calculate();
            r.settings.hideScore = false;
            r.update();
        });
    }
}
//# sourceMappingURL=Demo.js.map