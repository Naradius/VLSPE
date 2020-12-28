import { PartOfSpeech } from "../components/canvas/constraints/posConstraint.jsx";
import { RepetitionType } from "../components/canvas/patterns/repetitionPattern.jsx";
import { Orthography } from "../components/canvas/constraints/orthConstraint.jsx";
import { MorphAnima, MorphCase } from "../components/canvas/constraints/morphConstraint.jsx";

export default class JAPEGenerator {
    constructor(elements) {
        this.elements = elements;
        this.file = "";

        this.process = this.process.bind(this);
    }

    process() {
        const rules = this.elements.filter(function (x, i) {
            return x.constructor.name === 'RuleElementModel';
        });
        
        this.file += "Phase: JapeGenerated\nInput: Token\nOptions: control = appelt debug = true\n";
        const this1 = this;
        rules.forEach(function (x, i) {
            this1.processRule(x);
        });

        return this.file;
    }

    processRule(ruleEl) {
        this.file += "Rule: " + ruleEl.name + "\n(";
        if (ruleEl.sequence.length > 0) {
            const seqNext = ruleEl.sequence[0];
            this.processAnRepAl(seqNext);
        }
        this.file += "):match --> :match.Result = {rule = \"" + ruleEl.name + "\"}"
    }

    processAnRepAl(element) {
        if (element.type === 'BasicPatternModel') {
            this.processAnnotation(element);
        } else if (element.type === 'RepetitionPatternModel') {
            this.processRepetition(element);
        } else if (element.type === 'AlternativePatternModel') {
            this.processAlternative(element);
        }
    }

    processAnnotation(annotEl) {
        const this1 = this;

        let fileAdd = [];
        let fileBcp = this.file;
        this.file = "";
        annotEl.aggregation.forEach(element => {
            this1.processConstraint(element);
            fileAdd.push(this.file);
            this.file = "";
        });
        this.file = fileBcp;
        if (fileAdd.length > 1) {
            this.file += "(";
        }
        fileAdd = fileAdd.map(function (it) {
            return it.replace(/^\{+|\}+$/g, '');
        })
        this.file += "{";
        this.file += fileAdd.join(', ');
        this.file += "}";
        if (fileAdd.length > 1) {
            this.file += ")";
        }

        if (annotEl.sequence.length > 0) {
            this.processAnRepAl(annotEl.sequence[0]);
        }
    }

    processRepetition(repEl) {
        this.file += "(";
        const this1 = this;
        repEl.aggregation.forEach(element => {
            this1.processAnRepAl(element);
        });
        this.file += ")";

        if (repEl.repetitionType !== RepetitionType.None) {
            switch (repEl.repetitionType) {
                case RepetitionType.OneOrZero:
                    this.file += "?";
                    break;
                case RepetitionType.OneOrMore:
                    this.file += "+";
                    break;
                case RepetitionType.ZeroOrMore:
                    this.file += "*";
                    break;
            }
        } else {
            if (repEl.minRepetition === 0 && repEl.maxRepetition == 1) {
                this.file += "?";
            } else if (repEl.minRepetition === 0 && repEl.maxRepetition > 1) {
                this.file += "*";
            } else if (repEl.minRepetition > 1 && repEl.maxRepetition > 1) {
                this.file += "+";
            }
        }

        if (repEl.sequence.length > 0) {
            this.processAnRepAl(repEl.sequence[0]);
        }
    }

    processAlternative(altEl) {
        
    }

    processConstraint(conEl) {
        switch (conEl.constructor.name) {
            case 'POSConstraintModel':
                this.processPOSConst(conEl);
                break;
            case 'TokenConstraintModel':
                this.processTokenConst(conEl);
                break;
            case 'OrthographyConstraintModel':
                this.processOrthConst(conEl);
                break;
            case 'RuleConstraintModel':
                this.processRuleConst(conEl);
                break;
            case 'MorphologyConstraintModel':
                this.processMorphologyConst(conEl);
                break;
        }
    }

    processRuleConst(conEl) {
        this.file += "{Lookup.majorType == \"" + conEl.rule  + "\"}";
    }

    processTokenConst(conEl) {
        this.file += "{Token.string" + ((conEl.isRegex) ? "==~" : "==") + "\"" + conEl.value  + "\"}";
    }

    processOrthConst(conEl) {
        const moreThanOne = conEl.orthography.length > 1;
        if (moreThanOne) {
            this.file += "(";
        }

        const this1 = this;
        conEl.orthography.forEach(function (x, i) {
            this1.file += "{Token.orth == \"" + this1.convertOrthConstToJape(x)  + "\"}";
            if (conEl.orthography.length > 1 && i !== conEl.orthography.length - 1) {
                this1.file += " | ";
            }
        });
        
        if (moreThanOne) {
            this.file += ")";
        }
    }

    processMorphologyConst(conEl) {
        const this1 = this;
        this.file += "(";

        let moreThanOne = conEl.tense.length > 1,
            moreThanZero = conEl.tense.length > 0;

        const fileAdd = [];
        let str = "";

        if (moreThanOne) {
            str += "(";
        }

        conEl.tense.forEach(function(x, i) {
            str += "{Lookup.majorType == \"MorphTense\", Lookup.minorType == " + this1.convertMorphPropToJape(x)  + "}";
            if (conEl.tense.length > 1 && i !== conEl.tense.length - 1) {
                str += " | ";
            }
        });

        if (moreThanOne) {
            str += ")";
        }

        if (moreThanZero) {
            fileAdd.push(str);
        }
        
        str = "";

        moreThanOne = conEl.person.length > 1;
        moreThanZero = conEl.person.length > 0;

        if (moreThanOne) {
            str += "(";
        }
        
        conEl.person.forEach(function(x, i) {
            str += "{Lookup.majorType == \"MorphPerson\", Lookup.minorType == " + this1.convertMorphPropToJape(x)  + "}";
            if (conEl.person.length > 1 && i !== conEl.person.length - 1) {
                str += " | ";
            }
        });

        if (moreThanOne) {
            str += ")";
        }

        if (moreThanZero) {
            fileAdd.push(str);
        }

        str = "";

        moreThanOne = conEl.number.length > 1;
        moreThanZero = conEl.number.length > 0;

        if (moreThanOne) {
            str += "(";
        }
        
        conEl.number.forEach(function(x, i) {
            str += "{Lookup.majorType == \"MorphNumber\", Lookup.minorType == " + this1.convertMorphPropToJape(x)  + "}";
            if (conEl.number.length > 1 && i !== conEl.number.length - 1) {
                str += " | ";
            }
        });

        if (moreThanOne) {
            str += ")";
        }

        if (moreThanZero) {
            fileAdd.push(str);
        }

        str = "";

        moreThanOne = conEl.gender.length > 1;
        moreThanZero = conEl.gender.length > 0;

        if (moreThanOne) {
            str += "(";
        }
        
        conEl.gender.forEach(function(x, i) {
            str += "{Lookup.majorType == \"MorphGender\", Lookup.minorType == " + this1.convertMorphPropToJape(x)  + "}";
            if (conEl.gender.length > 1 && i !== conEl.gender.length - 1) {
                str += " | ";
            }
        });

        if (moreThanOne) {
            str += ")";
        }

        if (moreThanZero) {
            fileAdd.push(str);
        }

        str = "";

        moreThanOne = conEl.case.length > 1;
        moreThanZero = conEl.case.length > 0;

        if (moreThanOne) {
            str += "(";
        }
        
        conEl.case.forEach(function(x, i) {
            str += "{Lookup.majorType == \"MorphCase\", Lookup.minorType == " + this1.convertMorphPropToJape(x)  + "}";
            if (conEl.case.length > 1 && i !== conEl.case.length - 1) {
                str += " | ";
            }
        });

        if (moreThanOne) {
            str += ")";
        }

        if (moreThanZero) {
            fileAdd.push(str);
        }

        str = "";

        moreThanOne = conEl.anima.length > 1;
        moreThanZero = conEl.anima.length > 0;

        if (moreThanOne) {
            str += "(";
        }
        
        conEl.anima.forEach(function(x, i) {
            str += "{Lookup.majorType == \"MorphAnima\", Lookup.minorType == " + this1.convertMorphPropToJape(x)  + "}";
            if (conEl.anima.length > 1 && i !== conEl.anima.length - 1) {
                str += " | ";
            }
        });

        if (moreThanOne) {
            str += ")";
        }

        if (moreThanZero) {
            fileAdd.push(str);
        }

        this.file += fileAdd.join(' & ');
        
        this.file += ")";
    }

    processPOSConst(conEl) {
        const moreThanOne = conEl.partOfSpeech.length > 1;
        if (moreThanOne) {
            this.file += "(";
        }

        const this1 = this;
        conEl.partOfSpeech.forEach(function (x, i) {
            this1.file += "{Token.category == " + this1.convertPOSConstToJape(x)  + "}";
            if (conEl.partOfSpeech.length > 1 && i !== conEl.partOfSpeech.length - 1) {
                this1.file += " | ";
            }
        });
        
        if (moreThanOne) {
            this.file += ")";
        }
    }

    convertMorphPropToJape(morEnum) {
        return morEnum.name;
    }

    convertOrthConstToJape(otrhEnum) {
        switch (otrhEnum) {
            case Orthography.Capitalized:
                return "capitalized";
            case Orthography.Lowercase:
                return "lowercase";
            case Orthography.Multicap:
                return "multicap";
            case Orthography.Uppercase:
                return "uppercase";
        }
    }

    convertPOSConstToJape(posEnum) {
        switch (posEnum) {
            case PartOfSpeech.Adjective:
                return "JJ";
            case PartOfSpeech.Adverb:
                return "RB";
            case PartOfSpeech.Number:
                return "CD";
            case PartOfSpeech.Noun:
                return "NNP";
            case PartOfSpeech.Particle:
                return "RP";
            case PartOfSpeech.PersonalPronoun:
                return "PRP";
            case PartOfSpeech.PosessivePronoun:
                return "PRP$";
            case PartOfSpeech.Verb:
                return "VB";
            case PartOfSpeech.Prepositional:
                return "IN";
        }
    }
}