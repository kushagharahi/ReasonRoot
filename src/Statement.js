var Statement = (function () {
    function Statement(id, isProMain) {
        /** Does this statement support the main top statement in this graph (true) or disput it (false) */
        this.isProMain = true;
        /** Does this statement affect the confidence or the importance of it's parent */
        this.affects = "AverageTheConfidence";
        /** an array of statment id strings representing the ids of this statements children */
        this.childIds = [];
        this.id = id || newId();
        if (isProMain !== undefined)
            this.isProMain = isProMain;
    }
    return Statement;
}());
// inspired by http://stackoverflow.com/a/27872144/96062
function newId() {
    var len = 22;
    var str = "";
    for (var i = 0; i < len; i++) {
        var rand = Math.floor(Math.random() * 62);
        var charCode = rand += rand > 9 ? (rand < 36 ? 55 : 61) : 48;
        str += String.fromCharCode(charCode);
    }
    return str;
}
//# sourceMappingURL=Statement.js.map