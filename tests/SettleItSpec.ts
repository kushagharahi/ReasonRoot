describe('', function () {
    var controller: SettleIt;

    var mainStatement: Statement;
    var mainScore: Score;
    var expected: Statement;
    var dict: Dict<Score>;

    beforeAll(function () {
        jasmine.addMatchers(customMatchers);
    });

    beforeEach(function () {
        controller = new SettleIt();
        mainStatement = new Statement("s1");
        mainScore = new Score(mainStatement);
        dict = new Dict<Score>();
        dict[mainStatement.id] = mainScore;
        controller.mainStatment = mainStatement;
    });

    afterEach(function () {
        mainStatement.json = JSON.stringify(mainStatement, null, 4);
        mainStatement.testResults = environment.testResults;
    });


    describe("Base Simple Tests", function () {

        it("Pro, Con: should be +0", function () {
            mainStatement.childIds.push("1_1", "1_2");
            let st1_1 = new Statement("1_1", true);
            let sc1_1 = new Score(st1_1);
            let st1_2 = new Statement("1_2", false);
            let sc1_2 = new Score(st1_2);
            dict[st1_1.id] = sc1_1;
            dict[st1_2.id] = sc1_2;
           //expected.weightedPercentage = 0.5;
            //expected.weighted = { difference: 0 };

            controller.calculate(mainScore, dict);
            expect(mainScore.weightedPercentage).toEqual(0.5);
            expect(mainScore.weightDif).toEqual(0);
        });

    //    it("Pro, Pro: should be +2", function () {

    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                { id: "1.1", isProMain: true },
    //                { id: "1.2", isProMain: true }
    //            ]
    //        };

    //        expected = <Statement>{ id: "1", weightedPercentage: 1, weighted: { difference: 2 } };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    //// No longer working/important now that statements can not be reversed
    //    //it("Con, Con: should be -2", function () {

    //    //    mainStatement = <Statement>{
    //    //        id: "1", children: [
    //    //            { id: "1.1", isProMain: false },
    //    //            { id: "1.2", isProMain: false }
    //    //        ]
    //    //    };

    //    //    expected = <Statement>{ id: "1", weightedPercentage: 0, weighted: { difference: -2 } };

    //    //    controller.mainStatment = mainStatement;
    //    //    controller.calculate();
    //    //    expect(mainStatement).toBeSameGraph(expected);
    //    //});


    //    it("Pro, Pro [ Pro, Con ]: should be +2", function () {

    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                { id: "1.1" },
    //                {
    //                    id: "1.2", children: [
    //                        { id: "1.2.1", isProMain: true },
    //                        { id: "1.2.2", isProMain: false }
    //                    ]
    //                }
    //            ]
    //        };

    //        expected = <Statement>{ id: "1", weightedPercentage: 1, weighted: { difference: 2 } };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    it("Pro [ Pro, Pro, Pro ], Pro: should be +6", function () {

    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", children: [
    //                        { id: "1.2.1", isProMain: true },
    //                        { id: "1.2.2", isProMain: true },
    //                        { id: "1.2.3", isProMain: true }
    //                    ]
    //                },
    //                {
    //                    id: "1.2"
    //                }
    //            ]
    //        };

    //        expected = <Statement>{
    //            id: "1", weighted: { difference: 6 }, weightedPercentage: 1, children: [
    //                {
    //                    id: "1.1", children: [
    //                        { id: "1.2.1", mainPercent: 0.16666666666666666 },
    //                        { id: "1.2.2" },
    //                        { id: "1.2.3" }
    //                    ]
    //                }
    //            ]
    //        };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    it("Pro, Pro [ Pro, Pro, Con ]: should be +4", function () {

    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", children: [
    //                        { id: "1.2.1", isProMain: false },
    //                        { id: "1.2.2", isProMain: true },
    //                        { id: "1.2.3", isProMain: true }
    //                    ]
    //                },
    //                {
    //                    id: "1.2"
    //                }
    //            ]
    //        };

    //        expected = <Statement>{
    //            id: "1", weighted: { difference: 4 }, children: [
    //                {
    //                    id: "1.1", children: [
    //                        { id: "1.2.1", isProMain: false, mainPercent: 0.16666666666666666 }]
    //                }
    //            ]
    //        };

    //        controller.calculate(mainStatement, false);
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    it("Display points with differing weights: should be +4", function () {

    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", children: [
    //                        { id: "1.1.1" }
    //                    ]
    //                },
    //                {
    //                    id: "1.2", children: [
    //                        { id: "1.2.1" },
    //                        { id: "1.2.2" }
    //                    ]
    //                }
    //            ]
    //        };

    //        expected = <Statement>{
    //            id: "1", weighted: { difference: 4 }, mainPercent: 1, children: [
    //                {
    //                    id: "1.1", weighted: { pro: 2 }, mainPercent: .5, children: [
    //                        { id: "1.1.1", weighted: { pro: 2 }, mainPercent: .5 }
    //                    ]
    //                },
    //                {
    //                    id: "1.2", mainPercent: 0.5, children: [
    //                        { id: "1.2.1", mainPercent: 0.25 },
    //                        { id: "1.2.2" }
    //                    ]
    //                }
    //            ]
    //        };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });
    //});

    //describe("Important", function () {

    //    it("Con, Pro [ Big, Pro ]: should be +1", function () {

    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                { id: "1.1", isProMain: false },
    //                {
    //                    id: "1.2", isProMain: true, children: [
    //                        { id: "1.2.1", affects: "Importance" },
    //                        { id: "1.2.2" }
    //                    ]
    //                }
    //            ]
    //        };

    //        expected = <Statement>{ id: "1", weighted: { difference: 1 } };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    //// No longer working/important now that statements can not be reversed
    //    //it("Con, Pro [ Small ]: should be -0.5", function () {

    //    //    mainStatement = <Statement>{
    //    //        id: "1", children: [
    //    //            { id: "1.1", isProMain: false },
    //    //            {
    //    //                id: "1.2", isProMain: true, children: [
    //    //                    { id: "1.2.1", isProMain: false, affects: "Importance" },
    //    //                    { id: "1.2.2" }
    //    //                ]
    //    //            }
    //    //        ]
    //    //    };

    //    //    expected = <Statement>{ id: "1", weighted: { difference: -.5 } };

    //    //    controller.mainStatment = mainStatement;
    //    //    controller.calculate();
    //    //    expect(mainStatement).toBeSameGraph(expected);
    //    //});
    //});

    //describe("Confidence Maximum Math Type", function () {
    //    it("Simplest", function () {

    //        mainStatement = <Statement>{
    //            id: "main", children: [
    //                {
    //                    id: "1", affects: "MaximumOfConfidence", children: [
    //                        { id: "1.1", isProMain: true },
    //                        { id: "1.2", isProMain: true },
    //                        { id: "1.2", isProMain: false }
    //                    ]
    //                },
    //                {
    //                    id: "3", affects: "MaximumOfConfidence", children: [
    //                        { id: "3.1", isProMain: true },
    //                        { id: "3.2", isProMain: false },
    //                    ]
    //                }
    //            ]
    //        };

    //        expected = <Statement>{ id: "main", weighted: { difference: 1 } };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });
    //});

    //it("Generations", function () {

    //    mainStatement = <Statement>{
    //        id: "main", children: [
    //            {
    //                id: "1", children: [
    //                    {
    //                        id: "1.1", children: [
    //                            {
    //                                id: "1.1.1", children: [
    //                                    { id: "1.1.1.1" }
    //                                ]
    //                            }
    //                        ]
    //                    }
    //                ]
    //            },
    //            {
    //                id: "2", children: [
    //                    {
    //                        id: "2.2", children: [
    //                            {
    //                                id: "2.2.2", children: [
    //                                    { id: "2.2.2.2" }
    //                                ]
    //                            }
    //                        ]
    //                    }
    //                ]
    //            }
    //        ]
    //    };

    //    expected = mainStatement = <Statement>{
    //        id: "main", generation: 0, children: [
    //            {
    //                id: "1", generation: 1, children: [
    //                    {
    //                        id: "1.1", generation: 2, children: [
    //                            {
    //                                id: "1.1.1", generation: 3, children: [
    //                                    { id: "1.1.1.1", generation: 4 }
    //                                ]
    //                            }
    //                        ]
    //                    }
    //                ]
    //            },
    //            {
    //                id: "2", generation: 1, children: [
    //                    {
    //                        id: "2.2", generation: 2, children: [
    //                            {
    //                                id: "2.2.2", generation: 3, children: [
    //                                    { id: "2.2.2.2", generation: 4 }
    //                                ]
    //                            }
    //                        ]
    //                    }
    //                ]
    //            }
    //        ]
    //    };

    //    controller.mainStatment = mainStatement;
    //    controller.calculate();
    //    expect(mainStatement).toBeSameGraph(expected);
    //});

    //describe("Updates", function () {
    //    it("Pro then Pro: should be +1 then +2", function () {

    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                { id: "1.1", isProMain: true },
    //            ]
    //        };

    //        expected = <Statement>{ id: "1", weightedPercentage: 1, weighted: { difference: 1 } };
    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);

    //        mainStatement.children.push(<Statement>{ id: "1.2" });
    //        controller.calculate();
    //        expected = <Statement>{ id: "1", weightedPercentage: 1, weighted: { difference: 2 } };
    //    });
    //});

    //describe("Sorting", function () {
    //    it("Should Sort", function () {

    //        mainStatement = <Statement>{
    //            id: "main", children: [
    //                {
    //                    id: "1", children: [
    //                        { id: "1.1", isProMain: true },
    //                        { id: "1.2", isProMain: false },
    //                    ]
    //                },
    //                {
    //                    id: "2", children: [
    //                        { id: "2.1", isProMain: true },
    //                        { id: "2.2", isProMain: true },
    //                        { id: "2.4", isProMain: false },
    //                    ]
    //                },
    //                {
    //                    id: "3", children: [
    //                        { id: "3.1", isProMain: true },
    //                    ]
    //                },
    //                {
    //                    id: "4", children: [
    //                        { id: "4.1", isProMain: true },
    //                        { id: "4.2", isProMain: true },
    //                        { id: "4.3", isProMain: true },
    //                        { id: "4.4", isProMain: false },
    //                    ]
    //                },
    //                {
    //                    id: "5", children: [
    //                        { id: "4.1", isProMain: true },
    //                        { id: "4.2", isProMain: true },
    //                        { id: "4.2", isProMain: true },
    //                        { id: "4.3", isProMain: false },
    //                        { id: "4.4", isProMain: false },
    //                    ]
    //                }
    //            ]
    //        };

    //        expected = <Statement>{
    //            id: "main", children: [
    //                { id: "3" },
    //                { id: "4" },
    //                { id: "2" },
    //                { id: "5" },
    //                { id: "1" },
    //            ]
    //        };
    //        controller.calculate(mainStatement, true);
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });
    //});

    //describe("simple not reversible", function () {
    //    it("Pro [pro,con,con] should be 0 instead of -1", function () {
    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                { id: "1.1", isProMain: true },
    //                { id: "1.2", isProMain: false },
    //                { id: "1.3", isProMain: false },
    //            ]
    //        };

    //        expected = <Statement>{
    //            id: "1", weighted: { difference: 0 }, children: [
    //                { id: "1.1", weighted: { difference: 1 } },
    //                //{ id: "1.2", weighted: { difference: -.5 } }, //Future may have the weights change if statements should have gone negative
    //                //{ id: "1.3", weighted: { difference: -.5 } },
    //            ]
    //        };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();

    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    it("1 level down pro", function () {
    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProMain: true, children: [
    //                        { id: "1.1.1", isProMain: true },
    //                        { id: "1.1.2", isProMain: false },
    //                        { id: "1.1.3", isProMain: false },                        ]
    //                }
    //            ]
    //        };

    //        expected = <Statement>{
    //            id: "1", weighted: { difference: 0 }, children: [
    //                { id: "1.1", weighted: { difference: 0 } },
    //                //{ id: "1.2", weighted: { difference: -.5 } }, //Future may have the weights change if statements should have gone negative
    //                //{ id: "1.3", weighted: { difference: -.5 } },
    //            ]
    //        };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();

    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    it("Not Reverse Con ProMain", function () {
    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProMain: false, children: [
    //                        { id: "1.1.1", isProMain: true }
    //                    ]
    //                }
    //            ]
    //        };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expected = <Statement>{
    //            id: "1", weighted: { difference: 0 }, children: [
    //                { id: "1.1", weighted: { difference: 0 } },
    //            ]
    //        };
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    it("Not Reverse Con ProParent", function () {
    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, children: [
    //                        { id: "1.1.1", isProParent: false }
    //                    ]
    //                }
    //            ]
    //        };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expected = <Statement>{
    //            id: "1", weighted: { difference: 0 }, children: [
    //                { id: "1.1", weighted: { difference: 0 } },
    //            ]
    //        };
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //});

    //describe("isProMain and isProParent", function () {
    //    it("3 generation cons", function () {
    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, children: [
    //                        { id: "1.1.1", isProParent: false }
    //                    ]
    //                },
    //            ]
    //        };

    //        expected = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, isProMain: false, children: [
    //                        { id: "1.1.1", isProParent: false, isProMain: true }
    //                    ]
    //                },
    //            ]
    //        };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });

    //    it("3 generation cons with conflicting info", function () {
    //        mainStatement = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, isProMain: false, children: [
    //                        { id: "1.1.1", isProParent: true, isProMain: true }
    //                    ]
    //                },
    //            ]
    //        };

    //        expected = <Statement>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, isProMain: false, children: [
    //                        { id: "1.1.1", isProParent: false, isProMain: true }
    //                    ]
    //                },
    //            ]
    //        };

    //        controller.mainStatment = mainStatement;
    //        controller.calculate();
    //        expect(mainStatement).toBeSameGraph(expected);
    //    });
    });


});


