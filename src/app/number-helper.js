define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var NumberHelper = (function () {
        function NumberHelper() {
        }
        NumberHelper.prototype.contructor = function () {
        };
        ;
        NumberHelper.prototype.formatAsCurrency = function (val) {
            return (val == null) ? "" : "$" + val.toFixed(2);
        };
        ;
        return NumberHelper;
    }());
    exports["default"] = NumberHelper;
});
