
import parser from "./lsplParserSource.js";
import { RuleElementModel } from '../components/canvas/ruleElement.jsx';
import { BasicPatternModel } from '../components/canvas/patterns/basicPattern.jsx';
import { RuleConstraintModel } from '../components/canvas/constraints/ruleConstraint.jsx';
import { RepetitionPatternModel, RepetitionType } from '../components/canvas/patterns/repetitionPattern.jsx';
import { AlternativePatternModel, Operation } from '../components/canvas/patterns/alternativePattern.jsx';
import { POSConstraintModel, PartOfSpeech } from '../components/canvas/constraints/posConstraint.jsx';
import { OrthographyConstraintModel, Orthography } from '../components/canvas/constraints/orthConstraint.jsx';
import { TokenConstraintModel } from '../components/canvas/constraints/tokenConstraint.jsx';
import { MorphologyConstraintModel, MorphNumber, MorphCase, MorphGender, MorphPerson, MorphTense, MorphAnima } from '../components/canvas/constraints/morphConstraint.jsx';
const { parse } = parser;

export default class LSPLParser {
    constructor(text) {
        this.text = text;
        this.elements = [];
        this.globalIndex = 0;
        this.x = 5;
        this.y = 5;

        this.createBasicEl = this.createBasicEl.bind(this);
        this.processAlternative = this.processAlternative.bind(this);
        this.processRepetition = this.processRepetition.bind(this);
        this.processSequence = this.processSequence.bind(this);
    }

    createBasicEl() {
        var element = new BasicPatternModel(this.globalIndex, this.x, this.y);
        this.globalIndex++;
        this.x += 75;
        this.y += 75;
        this.elements.push(element);

        return element;
    }

    processAlternative(element) {
        if (element && element.elements && element.elements.length > 0)
        {
            var seqeunce = element.elements[0];
            if (sequence && sequence.length > 0) {
                var repe = new AlternativePatternModel(this.globalIndex, this.x, this.y);
                this.globalIndex++;
                this.x += 75;
                this.y += 75;
                this.elements.push(repe);

                var first = processSequence(sequence);
                if (first) {
                    repe.aggregation.push(first);
                }

                return repe;
            }
        }
    }

    processRepetition(element) {
        if (element && element.elements && element.elements.length > 0)
        {
            var seqeunce = element.elements[0];
            if (sequence && sequence.length > 0) {
                var repe = new RepetitionPatternModel(this.globalIndex, this.x, this.y);
                if (element.minimum) {
                    repe.minRepetition = element.minimum;
                }
                if (element.maximum) {
                    repe.maxRepetition = element.maximum;
                }
                this.globalIndex++;
                this.x += 75;
                this.y += 75;
                this.elements.push(repe);

                var first = processSequence(sequence);
                if (first) {
                    repe.aggregation.push(first);
                }

                return repe;
            }
        }
    }

    processSequence(sequence) {
        var previous = null;
        var first = null;
        if (sequence) {
            const this1 = this;
            sequence.forEach(function (el) {
                switch (el.type) {
                    case 'string':
                        var element = this1.createBasicEl();
                        if (previous) {
                            previous.sequence.push(element);
                        }
                        if (!first) {
                            first = element;
                        }
                        previous = element;
                        var constr = new TokenConstraintModel(this1.globalIndex, this1.x, this1.y);
                        constr.value = el.value;
                        this1.globalIndex++;
                        this1.x += 75;
                        this1.y += 75;
                        this1.elements.push(constr);
                        element.aggregation.push(constr);
                        break;
                    case 'object':                     
                        var element = this1.createBasicEl();
                        if (previous) {
                            previous.sequence.push(element);
                        }
                        if (!first) {
                            first = element;
                        }
                        previous = element;
                        var ruleElN = el.name;
                        var ruleCon = new RuleConstraintModel(this1.globalIndex, this1.x, this1.y);
                        ruleCon.rule = rule;
                        this1.globalIndex++;
                        this1.x += 75;
                        this1.y += 75;
                        this1.elements.push(ruleCon);
                        element.aggregation.push(ruleCon);
    
                        if (el.props && el.props.length > 0) {
                            var used = false;
                            var tense = [];
                            var person = [];
                            var number = [];
                            var gender = [];
                            var cases = [];
                            var anima = [];
                            
                            el.props.forEach(function (prop) {
                                if (prop.name && prop.value) {
                                    switch (prop.name) {
                                        case 'c':
                                            switch (prop.value) {
                                                case 'nom':
                                                    cases.push(MorphCase.Nominative);
                                                    break;
                                                case 'gen':
                                                    cases.push(MorphCase.Genetive);
                                                    break;
                                                case 'dat':
                                                    cases.push(MorphCase.Dative);
                                                    break;
                                                case 'acc':
                                                    cases.push(MorphCase.Accusative);
                                                    break;
                                                case 'ins':
                                                    cases.push(MorphCase.Instrumental);
                                                    break;
                                                case 'prep':
                                                    cases.push(MorphCase.Prepositional);
                                                    break;
                                                case 'un':
                                                default:
                                                    cases.push(MorphCase.Uninflicted);
                                                    break;
                                            }
                                            break;
                                        case 'n':
                                            switch (prop.value) {
                                                case 'sing':
                                                    number.push(MorphNumber.Singular);
                                                    break;
                                                case 'plur':
                                                    number.push(MorphNumber.Plural);
                                                    break;
                                            }
                                            break;
                                        case 'g':
                                            switch (prop.value) {
                                                case 'masc':
                                                    gender.push(MorphGender.Masculine);
                                                    break;
                                                case 'fem':
                                                    gender.push(MorphGender.Femine);
                                                    break;
                                                case 'neut':
                                                    gender.push(MorphGender.Neuter);
                                                    break;
                                            }
                                            break;
                                        case 'doc':
                                            break;
                                        case 't':
                                            switch (prop.value) {
                                                case 'pres':
                                                    tense.push(MorphTense.Present);
                                                    break;
                                                case 'tpast':
                                                    tense.push(MorphTense.Past);
                                                    break;
                                                case 'fut':
                                                    tense.push(MorphTense.Future);
                                                    break;
                                                case 'inf':
                                                    tense.push(MorphTense.Infinitive);
                                                    break;
                                            }
                                            break;
                                        case 'a':
                                            switch (prop.value) {
                                                case 'anim':
                                                    anima.push(MorphAnima.Animate);
                                                    break;
                                                case 'inan':
                                                    anima.push(MorphAnima.Inanimate);
                                                    break;
                                            }
                                            break;
                                        case 'f':
                                            break;
                                        case 'm':
                                            break;
                                        case 'p':
                                            switch (prop.value) {
                                                case 'anim':
                                                    anima.push(MorphPerson.Animate);
                                                    break;
                                                case 'inan':
                                                    anima.push(MorphPerson.Inanimate);
                                                    break;
                                                case 'inan':
                                                    anima.push(MorphPerson.Inanimate);
                                                    break;
                                            }
                                            break;
                                        case 'r':
                                            break;
                                        default:
                                            break;
                                    }
                                } else if (typeof prop === 'string') {
                                    var constr = new TokenConstraintModel(this1.globalIndex, this1.x, this1.y);
                                    constr.value = prop;
                                    this1.globalIndex++;
                                    this1.x += 75;
                                    this1.y += 75;
                                    this1.elements.push(constr);
                                    element.aggregation.push(constr);
                                }
                            });
    
                            if (used) {
                                var morph = new MorphologyConstraintModel(this1.globalIndex, this1.x, this1.y);
                                morph.tense = tense;
                                morph.person = person;
                                morph.number = number;
                                morph.gender = gender;
                                morph.case = cases;
                                morph.anima = anima;
                                this1.globalIndex++;
                                this1.x += 75;
                                this1.y += 75;
                                this1.elements.push(morph);
                                element.aggregation.push(morph);
                            }
                        }
                        break;
                    case 'word':
                        var element = this1.createBasicEl();
                        if (previous) {
                            previous.sequence.push(element);
                        }
                        if (!first) {
                            first = element;
                        }
                        previous = element;
                        var pos = [];
                        switch (el.name) {
                            case 'N':
                                pos = [ PartOfSpeech.Noun ];
                                break;
                            case 'W':
                                break;
                            case 'A':
                                pos = [ PartOfSpeech.Adjective ];
                                break;
                            case 'V':
                                pos = [ PartOfSpeech.Verb ];
                                break;
                            case 'Pa':
                                pos = [ PartOfSpeech.Participle ];
                                break;
                            case 'Ap':
                                pos = [ PartOfSpeech.AdvParticiple ];
                                break;
                            case 'Pn':
                                pos = [ PartOfSpeech.PersonalPronoun, PartOfSpeech.PosessivePronoun ];
                                break;
                            case 'Av':
                                pos = [ PartOfSpeech.Adverb ];
                                break;
                            case 'Cn':
                                pos = [ PartOfSpeech.Conjunction ];
                                break;
                            case 'Pr':
                                pos = [ PartOfSpeech.Prepositional ];
                                break;
                            case 'Pt':
                                pos = [ PartOfSpeech.Particle ];
                                break;
                            case 'Int':
                                pos = [ PartOfSpeech.Interjection ];
                                break;
                            case 'Num':
                                pos = [ PartOfSpeech.Number ];
                                break;
                            default:
                                break;
                        }
    
                        if (pos.length > 0) {
                            var posM = new POSConstraintModel(this1.globalIndex, this1.x, this1.y);
                            posM.partOfSpeech = pos;
                            this1.globalIndex++;
                            this1.x += 75;
                            this1.y += 75;
                            this1.elements.push(posM);
                            element.aggregation.push(posM);
                        }
    
                        if (el.props && el.props.length > 0) {
                            var used = false;
                            var tense = [];
                            var person = [];
                            var number = [];
                            var gender = [];
                            var cases = [];
                            var anima = [];
                            
                            el.props.forEach(function (prop) {
                                if (prop.name && prop.value) {
                                    switch (prop.name) {
                                        case 'c':
                                            switch (prop.value) {
                                                case 'nom':
                                                    cases.push(MorphCase.Nominative);
                                                    break;
                                                case 'gen':
                                                    cases.push(MorphCase.Genetive);
                                                    break;
                                                case 'dat':
                                                    cases.push(MorphCase.Dative);
                                                    break;
                                                case 'acc':
                                                    cases.push(MorphCase.Accusative);
                                                    break;
                                                case 'ins':
                                                    cases.push(MorphCase.Instrumental);
                                                    break;
                                                case 'prep':
                                                    cases.push(MorphCase.Prepositional);
                                                    break;
                                                case 'un':
                                                default:
                                                    cases.push(MorphCase.Uninflicted);
                                                    break;
                                            }
                                            break;
                                        case 'n':
                                            switch (prop.value) {
                                                case 'sing':
                                                    number.push(MorphNumber.Singular);
                                                    break;
                                                case 'plur':
                                                    number.push(MorphNumber.Plural);
                                                    break;
                                            }
                                            break;
                                        case 'g':
                                            switch (prop.value) {
                                                case 'masc':
                                                    gender.push(MorphGender.Masculine);
                                                    break;
                                                case 'fem':
                                                    gender.push(MorphGender.Femine);
                                                    break;
                                                case 'neut':
                                                    gender.push(MorphGender.Neuter);
                                                    break;
                                            }
                                            break;
                                        case 'doc':
                                            break;
                                        case 't':
                                            switch (prop.value) {
                                                case 'pres':
                                                    tense.push(MorphTense.Present);
                                                    break;
                                                case 'tpast':
                                                    tense.push(MorphTense.Past);
                                                    break;
                                                case 'fut':
                                                    tense.push(MorphTense.Future);
                                                    break;
                                                case 'inf':
                                                    tense.push(MorphTense.Infinitive);
                                                    break;
                                            }
                                            break;
                                        case 'a':
                                            switch (prop.value) {
                                                case 'anim':
                                                    anima.push(MorphAnima.Animate);
                                                    break;
                                                case 'inan':
                                                    anima.push(MorphAnima.Inanimate);
                                                    break;
                                            }
                                            break;
                                        case 'f':
                                            break;
                                        case 'm':
                                            break;
                                        case 'p':
                                            switch (prop.value) {
                                                case 'anim':
                                                    anima.push(MorphPerson.Animate);
                                                    break;
                                                case 'inan':
                                                    anima.push(MorphPerson.Inanimate);
                                                    break;
                                                case 'inan':
                                                    anima.push(MorphPerson.Inanimate);
                                                    break;
                                            }
                                            break;
                                        case 'r':
                                            break;
                                        default:
                                            break;
                                    }
                                } else if (typeof prop === 'string') {
                                    var constr = new TokenConstraintModel(this1.globalIndex, this1.x, this1.y);
                                    constr.value = prop;
                                    this1.globalIndex++;
                                    this1.x += 75;
                                    this1.y += 75;
                                    this1.elements.push(constr);
                                    element.aggregation.push(constr);
                                }
                            });
    
                            if (used) {
                                var morph = new MorphologyConstraintModel(this1.globalIndex, this1.x, this1.y);
                                morph.tense = tense;
                                morph.person = person;
                                morph.number = number;
                                morph.gender = gender;
                                morph.case = cases;
                                morph.anima = anima;
                                this1.globalIndex++;
                                this1.x += 75;
                                this1.y += 75;
                                this1.elements.push(morph);
                                element.aggregation.push(morph);
                            }
                        }
                        break;
                    case 'repetition':
                        var element = this1.processRepetition(el);
                        if (previous) {
                            previous.sequence.push(element);
                        }
                        if (!first) {
                            first = element;
                        }
                        previous = element;
                        break;
                    case 'alternative':
                        var element = this1.processRepetition(el);
                        if (previous) {
                            previous.sequence.push(element);
                        }
                        if (!first) {
                            first = element;
                        }
                        previous = element;
                        break;                
                }            
            });
        }        

        return first;
    }

    process() {
        try {
            const tree = parser.parse(this.text);
            const rule = new RuleElementModel(this.globalIndex, this.x, this.y);
            rule.name = tree.name;
            this.elements.push(rule);
            this.globalIndex++;
            this.x += 75;
            this.y += 75;

            if (tree.patterns && tree.patterns.length > 0 
                && tree.patterns[0].pattern && tree.patterns[0].pattern.length > 0 
                && tree.patterns[0].pattern[0] && tree.patterns[0].pattern[0].sequence) {
                var first = this.processSequence(tree.patterns[0].pattern[0].sequence);
                rule.sequence.push(first);
            }

            return this.elements;
        }
        catch (ex) {
            this.exception = ex.message;
            return [];
        }
    }
}