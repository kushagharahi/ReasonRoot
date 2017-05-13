describe('', function () {
    var controller: SettleIt;

    var mainClaim: Claim;
    var mainScore: Score;
    var expected: Claim;
    var dict: Dict<Score>;

    beforeAll(function () {
        jasmine.addMatchers(customMatchers);
    });

    beforeEach(function () {
        controller = new SettleIt();
        mainClaim = new Claim("s1");
        mainScore = new Score(mainClaim);
        dict = new Dict<Score>();
        dict[mainClaim.id] = mainScore;
        controller.mainStatment = mainClaim;
    });

    afterEach(function () {
        mainClaim.json = JSON.stringify(mainClaim, null, 4);
        mainClaim.testResults = environment.testResults;
    });


    describe("Base Simple Tests", function () {

        it("Pro, Con: should be +0", function () {
            mainClaim.childIds.push("1_1", "1_2");
            let st1_1 = new Claim("1_1", true);
            let sc1_1 = new Score(st1_1);
            let st1_2 = new Claim("1_2", false);
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

    //        mainClaim = <Claim>{
    //            id: "1", children: [
    //                { id: "1.1", isProMain: true },
    //                { id: "1.2", isProMain: true }
    //            ]
    //        };

    //        expected = <Claim>{ id: "1", weightedPercentage: 1, weighted: { difference: 2 } };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    //// No longer working/important now that claims can not be reversed
    //    //it("Con, Con: should be -2", function () {

    //    //    mainClaim = <Claim>{
    //    //        id: "1", children: [
    //    //            { id: "1.1", isProMain: false },
    //    //            { id: "1.2", isProMain: false }
    //    //        ]
    //    //    };

    //    //    expected = <Claim>{ id: "1", weightedPercentage: 0, weighted: { difference: -2 } };

    //    //    controller.mainStatment = mainClaim;
    //    //    controller.calculate();
    //    //    expect(mainClaim).toBeSameGraph(expected);
    //    //});


    //    it("Pro, Pro [ Pro, Con ]: should be +2", function () {

    //        mainClaim = <Claim>{
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

    //        expected = <Claim>{ id: "1", weightedPercentage: 1, weighted: { difference: 2 } };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    it("Pro [ Pro, Pro, Pro ], Pro: should be +6", function () {

    //        mainClaim = <Claim>{
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

    //        expected = <Claim>{
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

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    it("Pro, Pro [ Pro, Pro, Con ]: should be +4", function () {

    //        mainClaim = <Claim>{
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

    //        expected = <Claim>{
    //            id: "1", weighted: { difference: 4 }, children: [
    //                {
    //                    id: "1.1", children: [
    //                        { id: "1.2.1", isProMain: false, mainPercent: 0.16666666666666666 }]
    //                }
    //            ]
    //        };

    //        controller.calculate(mainClaim, false);
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    it("Display points with differing weights: should be +4", function () {

    //        mainClaim = <Claim>{
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

    //        expected = <Claim>{
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

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });
    //});

    //describe("Important", function () {

    //    it("Con, Pro [ Big, Pro ]: should be +1", function () {

    //        mainClaim = <Claim>{
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

    //        expected = <Claim>{ id: "1", weighted: { difference: 1 } };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    //// No longer working/important now that claims can not be reversed
    //    //it("Con, Pro [ Small ]: should be -0.5", function () {

    //    //    mainClaim = <Claim>{
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

    //    //    expected = <Claim>{ id: "1", weighted: { difference: -.5 } };

    //    //    controller.mainStatment = mainClaim;
    //    //    controller.calculate();
    //    //    expect(mainClaim).toBeSameGraph(expected);
    //    //});
    //});

    //describe("Confidence Maximum Math Type", function () {
    //    it("Simplest", function () {

    //        mainClaim = <Claim>{
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

    //        expected = <Claim>{ id: "main", weighted: { difference: 1 } };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });
    //});

    //it("Generations", function () {

    //    mainClaim = <Claim>{
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

    //    expected = mainClaim = <Claim>{
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

    //    controller.mainStatment = mainClaim;
    //    controller.calculate();
    //    expect(mainClaim).toBeSameGraph(expected);
    //});

    //describe("Updates", function () {
    //    it("Pro then Pro: should be +1 then +2", function () {

    //        mainClaim = <Claim>{
    //            id: "1", children: [
    //                { id: "1.1", isProMain: true },
    //            ]
    //        };

    //        expected = <Claim>{ id: "1", weightedPercentage: 1, weighted: { difference: 1 } };
    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);

    //        mainClaim.children.push(<Claim>{ id: "1.2" });
    //        controller.calculate();
    //        expected = <Claim>{ id: "1", weightedPercentage: 1, weighted: { difference: 2 } };
    //    });
    //});

    //describe("Sorting", function () {
    //    it("Should Sort", function () {

    //        mainClaim = <Claim>{
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

    //        expected = <Claim>{
    //            id: "main", children: [
    //                { id: "3" },
    //                { id: "4" },
    //                { id: "2" },
    //                { id: "5" },
    //                { id: "1" },
    //            ]
    //        };
    //        controller.calculate(mainClaim, true);
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });
    //});

    //describe("simple not reversible", function () {
    //    it("Pro [pro,con,con] should be 0 instead of -1", function () {
    //        mainClaim = <Claim>{
    //            id: "1", children: [
    //                { id: "1.1", isProMain: true },
    //                { id: "1.2", isProMain: false },
    //                { id: "1.3", isProMain: false },
    //            ]
    //        };

    //        expected = <Claim>{
    //            id: "1", weighted: { difference: 0 }, children: [
    //                { id: "1.1", weighted: { difference: 1 } },
    //                //{ id: "1.2", weighted: { difference: -.5 } }, //Future may have the weights change if claims should have gone negative
    //                //{ id: "1.3", weighted: { difference: -.5 } },
    //            ]
    //        };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();

    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    it("1 level down pro", function () {
    //        mainClaim = <Claim>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProMain: true, children: [
    //                        { id: "1.1.1", isProMain: true },
    //                        { id: "1.1.2", isProMain: false },
    //                        { id: "1.1.3", isProMain: false },                        ]
    //                }
    //            ]
    //        };

    //        expected = <Claim>{
    //            id: "1", weighted: { difference: 0 }, children: [
    //                { id: "1.1", weighted: { difference: 0 } },
    //                //{ id: "1.2", weighted: { difference: -.5 } }, //Future may have the weights change if claims should have gone negative
    //                //{ id: "1.3", weighted: { difference: -.5 } },
    //            ]
    //        };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();

    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    it("Not Reverse Con ProMain", function () {
    //        mainClaim = <Claim>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProMain: false, children: [
    //                        { id: "1.1.1", isProMain: true }
    //                    ]
    //                }
    //            ]
    //        };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expected = <Claim>{
    //            id: "1", weighted: { difference: 0 }, children: [
    //                { id: "1.1", weighted: { difference: 0 } },
    //            ]
    //        };
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    it("Not Reverse Con ProParent", function () {
    //        mainClaim = <Claim>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, children: [
    //                        { id: "1.1.1", isProParent: false }
    //                    ]
    //                }
    //            ]
    //        };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expected = <Claim>{
    //            id: "1", weighted: { difference: 0 }, children: [
    //                { id: "1.1", weighted: { difference: 0 } },
    //            ]
    //        };
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //});

    //describe("isProMain and isProParent", function () {
    //    it("3 generation cons", function () {
    //        mainClaim = <Claim>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, children: [
    //                        { id: "1.1.1", isProParent: false }
    //                    ]
    //                },
    //            ]
    //        };

    //        expected = <Claim>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, isProMain: false, children: [
    //                        { id: "1.1.1", isProParent: false, isProMain: true }
    //                    ]
    //                },
    //            ]
    //        };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });

    //    it("3 generation cons with conflicting info", function () {
    //        mainClaim = <Claim>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, isProMain: false, children: [
    //                        { id: "1.1.1", isProParent: true, isProMain: true }
    //                    ]
    //                },
    //            ]
    //        };

    //        expected = <Claim>{
    //            id: "1", children: [
    //                {
    //                    id: "1.1", isProParent: false, isProMain: false, children: [
    //                        { id: "1.1.1", isProParent: false, isProMain: true }
    //                    ]
    //                },
    //            ]
    //        };

    //        controller.mainStatment = mainClaim;
    //        controller.calculate();
    //        expect(mainClaim).toBeSameGraph(expected);
    //    });
    });


});


