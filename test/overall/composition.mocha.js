var { expect } = require("chai");

var plywood = require('../../build/plywood');
var { $, ply, r } = plywood;

describe("composition", function() {
  it("works in blank case", function() {
    var ex = ply();
    return expect(ex.toJS()).to.deep.equal({
      "op": "literal",
      "type": "DATASET",
      "value": [{}]
    });
  });

  it("works in ref case", function() {
    var ex = $("diamonds");
    return expect(ex.toJS()).to.deep.equal({
      "op": "ref",
      "name": "diamonds"
    });
  });

  it("works in uber-basic case", function() {
    var ex = ply()
    .apply('five', 5)
    .apply('nine', 9);

    return expect(ex.toJS()).to.deep.equal({
      "op": "chain",
      "expression": {
        "op": "literal",
        "type": "DATASET",
        "value": [{}]
      },
      "actions": [
        {
          "action": "apply",
          "name": "five",
          "expression": { "op": "literal", "value": 5 }
        },
        {
          "action": "apply",
          "name": "nine",
          "expression": { "op": "literal", "value": 9 }
        }
      ]
    });
  });

  it("works IN of a set", function() {
    var ex = $("x").in(['A', 'B', 'C']);
    return expect(ex.toJS()).to.deep.equal({
      "action": {
        "action": "in",
        "expression": {
          "op": "literal",
          "type": "SET",
          "value": {
            "elements": [
              "A",
              "B",
              "C"
            ],
            "setType": "STRING"
          }
        }
      },
      "expression": {
        "name": "x",
        "op": "ref"
      },
      "op": "chain"
    });
  });

  it("works IN of NumberRange", function() {
    var ex = $("x").in(3, 10);
    return expect(ex.toJS()).to.deep.equal({
      "action": {
        "action": "in",
        "expression": {
          "op": "literal",
          "type": "NUMBER_RANGE",
          "value": {
            "end": 10,
            "start": 3
          }
        }
      },
      "expression": {
        "name": "x",
        "op": "ref"
      },
      "op": "chain"
    });
  });

  it("works IN of TimeRange", function() {
    var ex = $("x").in(new Date('2015-03-03Z'), new Date('2015-10-10Z'));
    return expect(ex.toJS()).to.deep.equal({
      "action": {
        "action": "in",
        "expression": {
          "op": "literal",
          "type": "TIME_RANGE",
          "value": {
            "end": new Date('2015-10-10Z'),
            "start": new Date('2015-03-03Z')
          }
        }
      },
      "expression": {
        "name": "x",
        "op": "ref"
      },
      "op": "chain"
    });
  });

  it("works IN of TimeRange (as strings)", function() {
    var ex = $("x").in('2015-03-03Z', '2015-10-10Z');
    return expect(ex.toJS()).to.deep.equal({
      "action": {
        "action": "in",
        "expression": {
          "op": "literal",
          "type": "TIME_RANGE",
          "value": {
            "end": new Date('2015-10-10Z'),
            "start": new Date('2015-03-03Z')
          }
        }
      },
      "expression": {
        "name": "x",
        "op": "ref"
      },
      "op": "chain"
    });
  });

  it("works in single split case", function() {
    var ex = $('data')
    .split('$page', 'Page', 'd');

    return expect(ex.toJS()).to.deep.equal({
      "action": {
        "action": "split",
        "dataName": "d",
        "expression": {
          "name": "page",
          "op": "ref"
        },
        "name": "Page"
      },
      "expression": {
        "name": "data",
        "op": "ref"
      },
      "op": "chain"
    });
  });

  it("works in multi split case", function() {
    var ex = $('data')
    .split({ Page: '$page', User: '$page' }, 'd');

    return expect(ex.toJS()).to.deep.equal({
      "action": {
        "action": "split",
        "dataName": "d",
        "splits": {
          "Page": {
            "name": "page",
            "op": "ref"
          },
          "User": {
            "name": "page",
            "op": "ref"
          }
        }
      },
      "expression": {
        "name": "data",
        "op": "ref"
      },
      "op": "chain"
    });
  });

  it("works in semi-realistic case", function() {
    var ex = ply()
    .apply(
      "Diamonds",
      ply()
      .filter($('color').is('D'))
      .apply("priceOver2", $("price").divide(2))
    )
    .apply('Count', $('Diamonds').count())
    .apply('TotalPrice', $('Diamonds').sum('$priceOver2'));

    return expect(ex.toJS()).to.deep.equal({
      "actions": [
        {
          "action": "apply",
          "expression": {
            "actions": [
              {
                "action": "filter",
                "expression": {
                  "action": {
                    "action": "is",
                    "expression": {
                      "op": "literal",
                      "value": "D"
                    }
                  },
                  "expression": {
                    "name": "color",
                    "op": "ref"
                  },
                  "op": "chain"
                }
              },
              {
                "action": "apply",
                "expression": {
                  "action": {
                    "action": "divide",
                    "expression": {
                      "op": "literal",
                      "value": 2
                    }
                  },
                  "expression": {
                    "name": "price",
                    "op": "ref"
                  },
                  "op": "chain"
                },
                "name": "priceOver2"
              }
            ],
            "expression": {
              "op": "literal",
              "type": "DATASET",
              "value": [
                {}
              ]
            },
            "op": "chain"
          },
          "name": "Diamonds"
        },
        {
          "action": "apply",
          "expression": {
            "action": {
              "action": "count"
            },
            "expression": {
              "name": "Diamonds",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "Count"
        },
        {
          "action": "apply",
          "expression": {
            "action": {
              "action": "sum",
              "expression": {
                "name": "priceOver2",
                "op": "ref"
              }
            },
            "expression": {
              "name": "Diamonds",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "TotalPrice"
        }
      ],
      "expression": {
        "op": "literal",
        "type": "DATASET",
        "value": [
          {}
        ]
      },
      "op": "chain"
    });
  });

  return it("works in semi-realistic case (using parser)", function() {
    var ex = ply()
    .apply("Diamonds", ply().filter("$color == 'D'").apply("priceOver2", "$price/2"))
    .apply('Count', $('Diamonds').count())
    .apply('TotalPrice', $('Diamonds').sum('$priceOver2'));

    return expect(ex.toJS()).to.deep.equal({
      "actions": [
        {
          "action": "apply",
          "expression": {
            "actions": [
              {
                "action": "filter",
                "expression": {
                  "action": {
                    "action": "is",
                    "expression": {
                      "op": "literal",
                      "value": "D"
                    }
                  },
                  "expression": {
                    "name": "color",
                    "op": "ref"
                  },
                  "op": "chain"
                }
              },
              {
                "action": "apply",
                "expression": {
                  "action": {
                    "action": "divide",
                    "expression": {
                      "op": "literal",
                      "value": 2
                    }
                  },
                  "expression": {
                    "name": "price",
                    "op": "ref"
                  },
                  "op": "chain"
                },
                "name": "priceOver2"
              }
            ],
            "expression": {
              "op": "literal",
              "type": "DATASET",
              "value": [
                {}
              ]
            },
            "op": "chain"
          },
          "name": "Diamonds"
        },
        {
          "action": "apply",
          "expression": {
            "action": {
              "action": "count"
            },
            "expression": {
              "name": "Diamonds",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "Count"
        },
        {
          "action": "apply",
          "expression": {
            "action": {
              "action": "sum",
              "expression": {
                "name": "priceOver2",
                "op": "ref"
              }
            },
            "expression": {
              "name": "Diamonds",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "TotalPrice"
        }
      ],
      "expression": {
        "op": "literal",
        "type": "DATASET",
        "value": [
          {}
        ]
      },
      "op": "chain"
    });
  });
});
