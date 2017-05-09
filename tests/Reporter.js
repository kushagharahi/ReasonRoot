var JsApiReporter = jasmine.JsApiReporter;

function Env(options) {
    JsApiReporter.call(this, options);

    this.specStarted = function (result) {
        this.testResults = result;

        //var label = document.createElement('div');
        //label.innerHTML = result.fullName;

        //document.body.appendChild(label);
    };

    this.specDone = function (result) {
        this.testResults = null;
    };
}

var environment = new Env({
    timer: new jasmine.Timer()
});
jasmine.getEnv().addReporter(environment);
