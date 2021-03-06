//const { expect } = require('chai');
const Grammar = RiTa.Grammar;

describe('RiTa.Grammar', () => {

    if (typeof module !== 'undefined') require('./before');

    let sentences1 = {
        "$start": "$noun_phrase $verb_phrase.",
        "$noun_phrase": "$determiner $noun",
        "$verb_phrase": "($verb | $verb $noun_phrase)",
        "$determiner": "(a | the)",
        "$noun": "(woman | man)",
        "$verb": "shoots"
    };

    let sentences2 = {
        "$start": "$noun_phrase $verb_phrase.",
        "$noun_phrase": "$determiner $noun",
        "$determiner": ["a", "the"],
        "$verb_phrase": ["$verb $noun_phrase", "$verb"],
        "$noun": ["woman", "man"],
        "$verb": "shoots"
    };

    let sentences3 = {
        "$start": "$noun_phrase $verb_phrase.",
        "$noun_phrase": "$determiner $noun",
        "$verb_phrase": "$verb | $verb $noun_phrase",
        "$determiner": "a | the",
        "$noun": "woman | man",
        "$verb": "shoots"
    };

    let grammars = [sentences1, sentences2, sentences3];

    it('should correctly call constructor', () => {
        ok(typeof new Grammar() !== 'undefined');
    });

    it('Should support seq() transforms', () => {
        let opts = ['a', 'b', 'c', 'd'];
        let rule = '(' + opts.join('|') + ').seq()';
        let rs = new Grammar({ start: rule });
        for (let i = 0; i < opts.length; i++) {
            let res = rs.expand();
            //console.log(i, ':', res);
            expect(res).eq(opts[i]);
        }

        rule = '(' + opts.join('|') + ').seq().capitalize()';
        rs = new Grammar({ start: rule });
        for (let i = 0; i < opts.length; i++) {
            let res = rs.expand();
           // console.log(i, ':', res);
            expect(res).eq(opts[i].toUpperCase());
        }
    });

    it('Should support rseq() transforms', () => {
        let opts = ['a', 'b', 'c', 'd'], result = [];
        let rule = '(' + opts.join('|') + ').rseq()';
        let rs = new Grammar({ start: rule });
        for (let i = 0; i < opts.length; i++) {
            let res = rs.expand();
            //console.log(i, ':', res);
            result.push(res);
        }
        expect(result).to.have.members(opts);

        rule = '(' + opts.join('|') + ').rseq().capitalize()';
        rs = new Grammar({ start: rule });
        result = [];
        for (let i = 0; i < opts.length; i++) {
            let res = rs.expand();
            //console.log(i, ':', res);
            result.push(res);
        }
        expect(result).to.have.members(opts.map(o => o.toUpperCase()));
    });

    it('should correctly resolve inlines', () => {
        let rg, rs;

        rg = new Grammar({
            "start": "[$chosen=$person] talks to $chosen.",
            "person": "Dave | Jill | Pete"
        });
        rs = rg.expand({ trace: 0 });
        //console.log(rs);
        expect(rs).to.be.oneOf(["Dave talks to Dave.", "Jill talks to Jill.", "Pete talks to Pete."]);

        rg = new Grammar({
            "start": "[$chosen=$person] talks to $chosen.",
            "person": "$Dave | $Jill | $Pete",
            "Dave": "Dave",
            "Jill": "Jill",
            "Pete": "Pete",
        });
        rs = rg.expand({ trace: 0 });
        //console.log(rs);
        expect(rs).to.be.oneOf(["Dave talks to Dave.", "Jill talks to Jill.", "Pete talks to Pete."]);

        rg = new Grammar({
            "start": "[$chosen=$person] talks to $chosen.",
            "person": "$Dave | $Jill | $Pete",
            "Dave": "Dave | Jill | Pete",
            "Jill": "Dave | Jill | Pete",
            "Pete": "Dave | Jill | Pete",
        });
        rs = rg.expand({ trace: 0 });
        //console.log(rs);
        expect(rs).to.be.oneOf(["Dave talks to Dave.", "Jill talks to Jill.", "Pete talks to Pete."]);
    });

    it("should correctly call setRules", () => {

        let rg = new Grammar();
        ok(typeof rg.rules !== 'undefined');
        ok(typeof rg.rules['start'] === 'undefined');
        ok(typeof rg.rules['noun_phrase'] === 'undefined');

        grammars.forEach(g => {
            rg.setRules(JSON.stringify(g));
            ok(typeof rg.rules !== 'undefined');
            ok(typeof rg.rules['start'] !== 'undefined');
            ok(typeof rg.rules['noun_phrase'] !== 'undefined');
        });
    });

    it("should correctly call addRule", () => {
        let rg = new Grammar();
        rg.addRule("$start", "$pet");
        ok(typeof rg.rules["start"] !== 'undefined');
        rg.addRule("$start", "$dog", .3);
        ok(typeof rg.rules["start"] !== 'undefined');
    });

    it("should correctly call removeRule", () => {

        grammars.forEach(g => {
            let rg1 = new Grammar(g);
            def(rg1.rules['start']);
            def(rg1.rules['noun_phrase']);

            rg1.removeRule('$noun_phrase');
            def(!rg1.rules['noun_phrase']);

            rg1.removeRule('$start');
            def(!rg1.rules['start']);

            rg1.removeRule('');
            rg1.removeRule('bad-name');
            rg1.removeRule(null);
            rg1.removeRule(undefined);
        });
    });

    it("should throw on bad grammar names", () => {
        let rg = new Grammar();
        expect(() => rg.expandFrom("wrongName")).to.throw();
        expect(() => rg.expand()).to.throw();
    });


    it("should correctly call expandFrom", () => {
        let rg = new Grammar();
        rg.addRule("$start", "$pet");
        rg.addRule("$pet", "($bird | $mammal)");
        rg.addRule("$bird", "(hawk | crow)");
        rg.addRule("$mammal", "dog");
        eq(rg.expand("$mammal"), "dog");
        for (let i = 0; i < 30; i++) {
            let res = rg.expand("$bird");
            ok(res === "hawk" || res === 'crow');
        }
    });

    it("should correctly call toString", () => {
        // TODO
    });

    it("should correctly call expand", () => {
        let rg = new Grammar();
        rg.addRule("$start", "pet");
        eq(rg.expand(), "pet");
        rg = new Grammar();
        rg.addRule("$start", "$pet");
        rg.addRule("$pet", "dog");
        eq(rg.expand(), "dog");
    });

    it("should correctly call expand.weights", () => {
        let rg = new Grammar();
        rg.addRule("$start", "$rule1");
        rg.addRule("$rule1", "cat | dog | boy");
        let found1 = false;
        let found2 = false;
        let found3 = false;
        for (let i = 0; i < 30; i++) {
            let res = rg.expand();
            ok(res === ("cat") || res === ("dog") || res === ("boy"));
            if (res === ("cat")) found1 = true;
            else if (res === ("dog")) found2 = true;
            else if (res === ("boy")) found3 = true;
        }
        ok(found1 && found2 && found3); // found all
    });

    it("should correctly call expandFrom.weights", () => {

        let rg = new Grammar();
        rg.addRule("$start", "$pet");
        rg.addRule("$pet", "$bird [9] | $mammal");
        rg.addRule("$bird", "hawk");
        rg.addRule("$mammal", "dog");

        eq(rg.expand("$mammal"), "dog");

        let hawks = 0, dogs = 0;
        for (let i = 0; i < 30; i++) {
            let res = rg.expand("$pet");
            ok(res === "hawk" || res === 'dog', 'got ' + res);
            if (res == "dog") dogs++;
            if (res == "hawk") hawks++;
        }
        ok(hawks > dogs * 2), 'got h=' + hawks + ', ' + dogs;
    });

    it("should correctly handle transforms", () => {
        let rg = new Grammar();
        rg.addRule("$start", "$pet.toUpperCase()");
        rg.addRule("$pet", "dog");
        eq(rg.expand(), "DOG");

        rg = new Grammar();
        rg.addRule("$start", "($pet | $animal)");
        rg.addRule("$animal", "$pet");
        rg.addRule("$pet", "(dog).toUpperCase()");
        eq(rg.expand(), "DOG");
    });

    it("should pluralize phrases in a transform", () => {
        let ctx = {
            pluralise: (s) => {
                s = s.trim();
                if (s.includes(' ')) {
                    let words = RiTa.tokenize(s);
                    let last = words.pop();
                    words.push(RiTa.pluralize(last));
                    return RiTa.untokenize(words);
                }
                return RiTa.pluralize(s);
            }
        };
        let rg = new RiTa.Grammar({
            start: '($state feeling).pluralise()',
            state: 'bad | bad',
        }, ctx);
        let res = rg.expand();
        expect(res).eq('bad feelings');
    });

    it("should allow context in expand", () => {
        let context, rg;
        context = { randomPosition: () => 'jobArea jobType' };
        rg = new RiTa.Grammar({ start: "My .randomPosition()." });
        expect(rg.expand({ context })).eq("My jobArea jobType.");

        context = { randomPosition: () => 'jobArea jobType' };
        rg = new RiTa.Grammar({ stat: "My .randomPosition()." });
        expect(rg.expand('stat', { context })).eq("My jobArea jobType.");
    });

    it("should handle custom transforms", () => {
        let context = { randomPosition: () => 'jobArea jobType' };
        let rg = new RiTa.Grammar({ start: "My .randomPosition()." }, context);
        expect(rg.expand()).eq("My jobArea jobType.");
    });

    it("should handle symbol transforms", () => {
        let rg = new Grammar({
            start: "$tmpl",
            tmpl: "$jrSr.capitalize()",
            jrSr: "(junior|junior)"
        });
        eq(rg.expand({ trace: 0 }), "Junior");

        rg = new Grammar({
            start: "$r.capitalize()",
            r: "(a|a)"
        });
        eq(rg.expand({ trace: 0 }), "A");

        rg = new Grammar({
            start: "$r.pluralize()",
            r: "( mouse | mouse )"
        });
        eq(rg.expand({ trace: 0 }), "mice");
    });

    it("should correctly handle special characters", () => {
        let rg, res, s;

        s = "{ \"$start\": \"hello &#124; name\" }";
        rg = new Grammar(s);
        res = rg.expand();
        //console.log(res);
        ok(res === "hello | name");

        s = "{ \"$start\": \"hello: name\" }";
        rg = new Grammar(s);
        res = rg.expand();
        ok(res === "hello: name");

        s = "{ \"$start\": \"&#8220;hello!&#8221;\" }";
        rg = new Grammar(s);

        s = "{ \"$start\": \"&lt;start&gt;\" }";
        rg = new Grammar(s);
        res = rg.expand();
        //console.log(res);
        ok(res === "<start>");

        s = "{ \"$start\": \"I don&#96;t want it.\" }";
        rg = new Grammar(s);
        res = rg.expand();
        //console.log(res);
        ok(res === "I don`t want it.");

        s = "{ \"$start\": \"&#39;I really don&#39;t&#39;\" }";
        rg = new Grammar(s);
        res = rg.expand();
        ok(res === "'I really don't'");

        s = "{ \"$start\": \"hello | name\" }";
        rg = new Grammar(s);
        for (let i = 0; i < 10; i++) {
            res = rg.expand();
            ok(res === "hello" || res === "name");
        }
    });

    function eql(a, b, c) { expect(a).eql(b, c); }
    function eq(a, b, c) { expect(a).eq(b, c); }
    function ok(a, m) { expect(a, m).to.be.true; }
    function def(res, m) { expect(res, m).to.not.be.undefined; }
});
