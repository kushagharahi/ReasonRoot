window.onload = function () {
    var claimElements = document.getElementsByTagName('claim');
    for (let claimElement of claimElements) {
        //var x = new reasonRootOld();
        //x.start(claimElement);
        var y = new RRDisplay(claimElement);
    }
}