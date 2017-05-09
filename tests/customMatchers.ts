var customMatchers: jasmine.CustomMatcherFactories = {
    toBeSameGraph: function (util: jasmine.MatchersUtil, customEqualityTesters: Array<jasmine.CustomEqualityTester>): jasmine.CustomMatcher {
        return {
            compare: function (actual: any, expected: any): jasmine.CustomMatcherResult {
                var result = compareObjects(expected, actual);


                return result;
            }
        };

        function compareObjects(o: any, p: any): jasmine.CustomMatcherResult {
            var results = '';
            var success = compareObjectsInternal(o, p);

            var result: jasmine.CustomMatcherResult = {
                pass: results == '',
                message: results
            }
            function compareObjectsInternal(o: any, p: any): boolean { //Need to use any to allow for partial statements
                if (p == undefined) p = {};
            var i,
                oKeys = Object.keys(o).sort(),
                pKeys = Object.keys(p).sort();
            for (i = 0; i < oKeys.length; ++i) {
                var oValue = o[oKeys[i]];
                var pValue = p[oKeys[i]];
                if (oValue instanceof Array) {
                    if (!(pValue instanceof Array))
                        addError();
                    //They are both arrays so I need to loop through them and send them to the compare objects function
                    var oArray = oValue;
                    var pArray = pValue;
                    for (var ai = 0; ai < oArray.length; ai++) {
                        compareObjectsInternal(oArray[ai], pArray[ai]);
                    }
                }
                else if (oValue instanceof Date) {
                    if (!(pValue instanceof Date))
                        addError();
                    if (('' + oValue) !== ('' + pValue))
                        addError();
                }
                else if (oValue instanceof Function) {
                    if (!(pValue instanceof Function))
                        addError();
                    //ignore functions
                }
                else if (oValue instanceof Object) {
                    if (!(pValue instanceof Object))
                        addError();
                    if (oValue === o) {//self reference?
                        if (pValue !== p)
                            addError();
                    }
                    compareObjectsInternal(oValue, pValue)
                    //addError();//WARNING: does not deal with circular refs other than ^^
                }
                else if (oValue !== pValue)//change !== to != for loose comparison
                    addError();
            }
            return true;

            //Format the error message
            function addError() {
                results += '[id:' + o.id + ':' + oKeys[i] + '=' + pValue + ' should be ' + oValue + ']';
            }
        }
            return result

        }


    }
};

declare module jasmine {
    interface Matchers {
        toBeSameGraph(expected: any): void;
    }
}

