var customMatchers = {
    toBeSameGraph: function (util, customEqualityTesters) {
        return {
            compare: function (actual, expected) {
                var result = compareObjects(expected, actual);
                return result;
            }
        };
        function compareObjects(o, p) {
            var results = '';
            var success = compareObjectsInternal(o, p);
            var result = {
                pass: results == '',
                message: results
            };
            function compareObjectsInternal(o, p) {
                if (p == undefined)
                    p = {};
                var i, oKeys = Object.keys(o).sort(), pKeys = Object.keys(p).sort();
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
                    }
                    else if (oValue instanceof Object) {
                        if (!(pValue instanceof Object))
                            addError();
                        if (oValue === o) {
                            if (pValue !== p)
                                addError();
                        }
                        compareObjectsInternal(oValue, pValue);
                    }
                    else if (oValue !== pValue)
                        addError();
                }
                return true;
                //Format the error message
                function addError() {
                    results += '[id:' + o.id + ':' + oKeys[i] + '=' + pValue + ' should be ' + oValue + ']';
                }
            }
            return result;
        }
    }
};
