import {Enum} from 'enumify';
import { ErrorCode } from './error';
import CAFETIERELexAnalyzer, { CAFETIERELexeme } from './cafetiereLexAnalyzer';
import { RuleElementModel } from '../components/canvas/ruleElement.jsx';
import { BasicPatternModel } from '../components/canvas/patterns/basicPattern.jsx';
import { RuleConstraintModel } from '../components/canvas/constraints/ruleConstraint.jsx';
import { RepetitionPatternModel, RepetitionType } from '../components/canvas/patterns/repetitionPattern.jsx';
import { POSConstraintModel, PartOfSpeech } from '../components/canvas/constraints/posConstraint.jsx';
import { OrthographyConstraintModel, Orthography } from '../components/canvas/constraints/orthConstraint.jsx';
import { TokenConstraintModel } from '../components/canvas/constraints/tokenConstraint.jsx';
import { MorphologyConstraintModel, MorphNumber } from '../components/canvas/constraints/morphConstraint.jsx';

export default class CAFETIERESynAnalyzer {
    constructor(ioModule) {
        this.ioModule = ioModule;
        this.lexAnalyzer = new CAFETIERELexAnalyzer(this.ioModule);
        this.hasErrors = false;
        this.elements = [];
        this.globalIndex = 0;
        this.parseState = 'rule';
        this.x = 5;
        this.y = 5;
    }

    process() {
        let result = '';
        while (result !== '<EOF>') {
            this.hasErrors = false;            
            result = this.analyzeRule(result, [CAFETIERELexeme.AnnotationBegin]);

            if (result !== CAFETIERELexeme.AnnotationBegin) {
                result = this.lexAnalyzer.nextSym();
            }
        }

        this.ioModule.nextChar();
    }

    createError(errCode) {
        this.ioModule.createError(errCode);
        this.hasErrors = true;
    }

    analyzeRule(received, postcondition) {
        let ruleEl = new RuleElementModel(this.globalIndex, this.x, this.y);
        this.elements.push(ruleEl);
        this.globalIndex++;
        this.x += 75;
        this.y += 75;

        let curSymbol = (!received) ? this.lexAnalyzer.nextSym() : received;

        //if (curSymbol === CAFETIERELexeme.AnnotationBegin) {
            const ret = this.analyzeAnnotation(curSymbol, [CAFETIERELexeme.RuleSymbol], false, true);
            curSymbol = ret.curSymbol;

            this.parseState = 'annots';

            curSymbol = (!curSymbol) ? this.lexAnalyzer.nextSym() : curSymbol;

            if (curSymbol === CAFETIERELexeme.RuleSymbol) {
                curSymbol = this.lexAnalyzer.nextSym();
                if (curSymbol === CAFETIERELexeme.AnnotationBegin || curSymbol === CAFETIERELexeme.AnnotationGroupBegin) {
                    this.nesting = 0;
                    curSymbol = this.analyzeAnnotationGroup(curSymbol, [CAFETIERELexeme.RulePrecondition]);

                    if (this.nesting != 0) {
                        this.createError(ErrorCode.BracketMismatch);
                    }
                }

                if (curSymbol !== CAFETIERELexeme.RulePrecondition) {
                    this.createError(ErrorCode.UnexpectedCharacter);
                    return curSymbol;
                } else {
                    this.nesting = 0;
                    curSymbol = this.analyzeAnnotationGroup('', [CAFETIERELexeme.RulePostcondition], true, this.globalIndex - 1);

                    if (this.nesting != 0) {
                        this.createError(ErrorCode.BracketMismatch);
                    }

                    if (curSymbol !== CAFETIERELexeme.RulePostcondition) {
                        this.createError(ErrorCode.UnexpectedCharacter);
                        return curSymbol;
                    } else {
                        curSymbol = this.lexAnalyzer.nextSym();
                        if (curSymbol === CAFETIERELexeme.AnnotationBegin || curSymbol === CAFETIERELexeme.AnnotationGroupBegin) {
                            this.nesting = 0;
                            curSymbol = this.analyzeAnnotationGroup(curSymbol, [CAFETIERELexeme.RuleEnd]);

                            if (this.nesting != 0) {
                                this.createError(ErrorCode.BracketMismatch);
                            }
                        }

                        if (curSymbol !== CAFETIERELexeme.RuleEnd) {
                            this.createError(ErrorCode.NonClosedRule);
                            return curSymbol;
                        }
                    }                
                }            
            } else {
                this.createError(ErrorCode.UnexpectedCharacter);
            }
        //} 
        // else {
        //     this.createError(ErrorCode.RuleExpected);

        //     while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
        //         curSymbol = this.lexAnalyzer.nextSym();
        //     }
        // }        

        return curSymbol;
    }

    analyzeAnnotationGroup(received, postcondition, createEl, prevEl) {
        let cPrevEl = prevEl;
        let curSymbol = (!received) ? this.lexAnalyzer.nextSym() : received;

        const myNest = this.nesting;
        const id = this.globalIndex;
        if (curSymbol === CAFETIERELexeme.AnnotationGroupBegin) {
            curSymbol = this.lexAnalyzer.nextSym();
            this.nesting++;
        }
        
        const ret = this.analyzeAnnotation(curSymbol, 
            [CAFETIERELexeme.RulePrecondition, CAFETIERELexeme.RulePostcondition, CAFETIERELexeme.FeatureDelimiter, CAFETIERELexeme.AnnotationGroupEnd, CAFETIERELexeme.RuleEnd, CAFETIERELexeme.AnnotationGroupEnd], true, false, createEl, prevEl);
        curSymbol = ret.curSymbol;        

        if (ret.repid) {
            cPrevEl = ret.repid
        } else {
            cPrevEl = id;
        }        

        if (curSymbol === CAFETIERELexeme.FeatureDelimiter) {
            curSymbol = this.analyzeAnnotationGroup('', postcondition, createEl, cPrevEl);
        }

        if (curSymbol === CAFETIERELexeme.AnnotationGroupEnd) {
            this.nesting--;
            curSymbol = this.lexAnalyzer.nextSym();
        }
        
        if (this.nesting === myNest) {
            if (curSymbol === CAFETIERELexeme.UserRepetitionStart || curSymbol === CAFETIERELexeme.OneOrMore || curSymbol === CAFETIERELexeme.ZeroOrMore || curSymbol === CAFETIERELexeme.ZeroOrOne) {
                curSymbol = this.analyzeRepetition(curSymbol, 
                    [CAFETIERELexeme.RulePrecondition, CAFETIERELexeme.RulePostcondition, CAFETIERELexeme.FeatureDelimiter, CAFETIERELexeme.AnnotationGroupEnd, CAFETIERELexeme.RuleEnd], createEl, cPrevEl);

                    cPrevEl = this.globalIndex - 1;
            }
        }

        if (curSymbol === CAFETIERELexeme.FeatureDelimiter) {
            curSymbol = this.analyzeAnnotationGroup('', postcondition, createEl, cPrevEl);
        }

        // if (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
        //     this.createError(ErrorCode.UnexpectedCharacter);
            
        //     while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
        //         curSymbol = this.lexAnalyzer.nextSym();
        //     }
        // }

        return curSymbol;
    }

    analyzeAnnotation(received, postcondition, canRepeat, returnIfNone, createEl, prevEl) {        
        let myid = this.globalIndex;
        let repid;
        if (createEl) {
            let annotEl = new BasicPatternModel(myid, this.x, this.y);
            this.x += 75;
            this.y += 75;
            this.elements.push(annotEl);
            
            if (prevEl !== undefined) {
                const prevElMod = this.elements[prevEl];
                prevElMod.sequence.push(annotEl);
                annotEl.rels = {
                    target: annotEl.uuid,
                    type: 'sequence',
                    source: prevElMod.uuid
                };
            }
            this.globalIndex++;
        }

        let curSymbol = (!received) ? this.lexAnalyzer.nextSym() : received;

        let doNext = true;
        const hasOpenBracket = curSymbol === CAFETIERELexeme.AnnotationBegin;
        if (!hasOpenBracket) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
            if (returnIfNone) {
                return curSymbol;
            }
            doNext = false;
        }
        
        const propGroup = this.analyzePropertyGroup('', [CAFETIERELexeme.AnnotationEnd], createEl, myid);
            curSymbol = (!propGroup) ? this.lexAnalyzer.nextSym() : propGroup;

            const hasCloseBracket = curSymbol === CAFETIERELexeme.AnnotationEnd;
            if (!hasCloseBracket) {
                this.createError(ErrorCode.NonClosedAnnotation);

                while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    curSymbol = this.lexAnalyzer.nextSym();
                }

                doNext = false;
            } else if (canRepeat) {
                curSymbol = this.lexAnalyzer.nextSym();
                doNext = false;
                if (curSymbol === CAFETIERELexeme.UserRepetitionStart || curSymbol === CAFETIERELexeme.OneOrMore || curSymbol === CAFETIERELexeme.ZeroOrMore || curSymbol === CAFETIERELexeme.ZeroOrOne) {
                    curSymbol = this.analyzeRepetition(curSymbol, 
                        [CAFETIERELexeme.RulePrecondition, CAFETIERELexeme.RulePostcondition, CAFETIERELexeme.FeatureDelimiter, CAFETIERELexeme.AnnotationGroupEnd, CAFETIERELexeme.RuleEnd], createEl, myid);
                    repid = this.globalIndex - 1;
                }
            }

        if (doNext) {
            curSymbol = this.lexAnalyzer.nextSym();
        }
        
        if (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
        }

        return {curSymbol: curSymbol, repid: repid};
    }

    analyzeRepetition(received, postcondition, createEl, annotEl) {
        let repEl = null;
        if (createEl) {
            repEl = new RepetitionPatternModel(this.globalIndex, this.x, this.y);
            repEl.repetitionType = RepetitionType.None;
            this.elements.push(repEl);
            this.x += 75;
            this.y += 75;
            repEl.ioLine = this.ioModule.lineNumber;
            repEl.ioPos = this.ioModule.positionNumber;
            this.globalIndex++;

            const prevRels = this.elements[annotEl].rels;
            if (prevRels) {
                const prevElMod = this.elements[annotEl];
                const prevPrevElMod = this.elements.find(function (x, i) {
                    return x.sequence.indexOf(prevElMod) != -1;
                });
                prevPrevElMod.sequence = prevPrevElMod.sequence.filter(function (x, i) {
                    return x !== prevElMod;
                });
                prevPrevElMod.sequence.push(repEl);
                const annotPrev = prevRels.source;
                repEl.rels = {
                    source: prevElMod.uuid,
                    target: repEl.uuid,
                    type: 'sequence'
                };
            }

            repEl.aggregation.push(this.elements[annotEl]);
            this.elements[annotEl].rels = {
                target: repEl.uuid,
                type: 'aggregation'
            };
        }
        
        let curSymbol = (!received) ? this.lexAnalyzer.nextSym() : received;

        const isDefaultRep = curSymbol === CAFETIERELexeme.OneOrMore || curSymbol === CAFETIERELexeme.ZeroOrMore || curSymbol === CAFETIERELexeme.ZeroOrOne;
        if (isDefaultRep) {
            if (repEl !== null) {
                switch (curSymbol) {
                    case CAFETIERELexeme.OneOrMore:
                        repEl.repetitionType = RepetitionType.OneOrMore;
                        break;
                    case CAFETIERELexeme.ZeroOrOne:
                        repEl.repetitionType = RepetitionType.OneOrZero;
                        break;
                    case CAFETIERELexeme.ZeroOrMore:
                        repEl.repetitionType = RepetitionType.ZeroOrMore;
                        break;
                }
            }           
            return this.lexAnalyzer.nextSym();
        }

        const hasOpenBracket = curSymbol === CAFETIERELexeme.UserRepetitionStart;
        if (!hasOpenBracket) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }

            return curSymbol;
        }

        curSymbol = this.lexAnalyzer.nextSym();
        const hasFirstNum = curSymbol === CAFETIERELexeme.UserRepetitionNumber;
        if (!hasFirstNum) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }

            return curSymbol;
        } else {
            if (repEl !== null) {
                repEl.minRepetition = this.lexAnalyzer.currentNumber;
            }            
        }

        curSymbol = this.lexAnalyzer.nextSym();
        const hasDelim = curSymbol === CAFETIERELexeme.FeatureDelimiter;
        if (!hasDelim) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }

            return curSymbol;
        }

        curSymbol = this.lexAnalyzer.nextSym();
        const hasSecondNum = curSymbol === CAFETIERELexeme.UserRepetitionNumber;
        if (!hasSecondNum) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }

            return curSymbol;
        } else {
            if (repEl !== null) {
                repEl.maxRepetition = this.lexAnalyzer.currentNumber;
            }            
        }

        curSymbol = this.lexAnalyzer.nextSym();
        const hasCloseBracket = curSymbol === CAFETIERELexeme.UserRepetitionEnd;
        if (!hasCloseBracket) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }

            return curSymbol;
        }

        curSymbol = this.lexAnalyzer.nextSym();
        if (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') { 
            this.createError(ErrorCode.UnexpectedCharacter);
            
            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
        }        

        return curSymbol;
    }

    analyzePropertyGroup(received, postcondition, createEl, prevEl) {
        let curSymbol = this.analyzeProperty(received, [CAFETIERELexeme.FeatureDelimiter, CAFETIERELexeme.AnnotationEnd], createEl, prevEl);
        
        //if (!prop) {
            curSymbol = (!curSymbol) ? this.lexAnalyzer.nextSym() : curSymbol;

            if (curSymbol === CAFETIERELexeme.FeatureDelimiter) {
                return this.analyzePropertyGroup('', postcondition, createEl, prevEl);
            } else {
                return curSymbol;
            }
        //}

        //return prop;
    }

    analyzeProperty(received, postcondition, createEl, prevEl) {
        let curSymbol = (!received) ? this.lexAnalyzer.nextSym() : received;
        
        switch (curSymbol) {
            case CAFETIERELexeme.SemanticFeature:
            case CAFETIERELexeme.IdFeature:
            case CAFETIERELexeme.LookupFeature:
            case CAFETIERELexeme.LocationFeature:
            case CAFETIERELexeme.ZoneFeature:
            case CAFETIERELexeme.SectorFeature:            
                return this.analyzeIdentProp(curSymbol, postcondition, createEl, prevEl);
            case CAFETIERELexeme.SyntacticFeature:
                return this.analyzeSynProp('', postcondition, createEl, prevEl);
            case CAFETIERELexeme.OrthFeature:
                return this.analyzeOrthProp('', postcondition, createEl, prevEl);            
            case CAFETIERELexeme.LemFeature:
                return this.analyzeStringProp('', postcondition, createEl, prevEl);
            case CAFETIERELexeme.TokenFeature:
            case CAFETIERELexeme.FirstName:
            case CAFETIERELexeme.SurName:
                return this.analyzeHybridProp('', postcondition, createEl, prevEl);
            case CAFETIERELexeme.NumberFeature:
                return this.analyzeNumberProp('', postcondition, createEl, prevEl);
            default:
                this.createError(ErrorCode.UnexpectedPropertyType);

                while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    curSymbol = this.lexAnalyzer.nextSym();
                }
                return curSymbol;
        }
    }

    analyzeHybridProp(received, postcondition, createEl, prevEl) {
        let propEl = null;
        if (createEl && this.parseState !== 'rule') {
            propEl = new TokenConstraintModel(this.globalIndex, this.x, this.y);
            this.x += 75;
            this.y += 75;
            const prevElllll = this.elements[prevEl];
            this.elements[prevEl].aggregation.push(propEl);
            propEl.rels = {
                target: prevElllll.uuid,
                type: 'aggregation'
            };
            this.elements.push(propEl);
            this.globalIndex++;
        }
        
        let curSymbol = this.lexAnalyzer.nextSym();
        if (curSymbol !== CAFETIERELexeme.Equality) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
        } else {
            curSymbol = this.lexAnalyzer.nextSym();
            if (curSymbol !== CAFETIERELexeme.Identifier && curSymbol !== CAFETIERELexeme.String) {
                this.createError(ErrorCode.UnexpectedCharacter);
                
                while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    curSymbol = this.lexAnalyzer.nextSym();
                }
            } else {
                if (propEl !== null) {
                    propEl.value = this.lexAnalyzer.currentString;
                }
                if (curSymbol === CAFETIERELexeme.String) {

                    curSymbol = this.lexAnalyzer.nextSym();
                    while (curSymbol === CAFETIERELexeme.AlternativeOperator) {
                        if (propEl !== null) {
                            propEl.isRegex = true;
                        }
                        curSymbol = this.lexAnalyzer.nextSym();
                        if (curSymbol !== CAFETIERELexeme.String) {
                            this.createError(ErrorCode.StringExpected);
                
                            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                                curSymbol = this.lexAnalyzer.nextSym();
                            }

                            return curSymbol;
                        } else {
                            if (propEl !== null) {
                                propEl.value = propEl.value + "|" + this.lexAnalyzer.currentString;
                            }
                        }

                        curSymbol = this.lexAnalyzer.nextSym();
                    }

                    if (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                        this.createError(ErrorCode.UnexpectedCharacter);
            
                        while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                            curSymbol = this.lexAnalyzer.nextSym();
                        }

                        return curSymbol;
                    }
                } else {
                    curSymbol = '';
                }                
            }
        }

        return curSymbol;
    }

    analyzeSynProp(received, postcondition, createEl, prevEl) {
        let propEl = null;
        if (createEl && this.parseState !== 'rule') {
            propEl = new POSConstraintModel(this.globalIndex, this.x, this.y);
            propEl.partOfSpeech = [];
            const prevEllll = this.elements[prevEl];
            this.elements[prevEl].aggregation.push(propEl);
            propEl.rels = {
                target: prevEllll.uuid,
                type: 'aggregation'
            };
            this.x += 75;
            this.y += 75;
            this.elements.push(propEl);
            this.globalIndex++;
        }
       
        let curSymbol = this.lexAnalyzer.nextSym();
        if (curSymbol !== CAFETIERELexeme.Equality) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
        } else {
            curSymbol = this.lexAnalyzer.nextSym();

            if (curSymbol !== CAFETIERELexeme.Noun && curSymbol !== CAFETIERELexeme.Prepositional
                 && curSymbol !== CAFETIERELexeme.Verb && curSymbol !== CAFETIERELexeme.Adverb
                 && curSymbol !== CAFETIERELexeme.Adjective) {
                this.createError(ErrorCode.UnexpectedCharacter);
                
                while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    curSymbol = this.lexAnalyzer.nextSym();
                }
            } else {
                if (propEl !== null)
                {
                    switch (curSymbol) {
                        case CAFETIERELexeme.Noun:
                            propEl.partOfSpeech.push(PartOfSpeech.Noun);
                            break;
                        case CAFETIERELexeme.Prepositional:
                            propEl.partOfSpeech.push(PartOfSpeech.Prepositional);
                            break;
                        case CAFETIERELexeme.Verb:
                            propEl.partOfSpeech.push(PartOfSpeech.Verb);
                            break;
                        case CAFETIERELexeme.Adverb:
                            propEl.partOfSpeech.push(PartOfSpeech.Adverb);
                            break;
                        case CAFETIERELexeme.Adjective:
                            propEl.partOfSpeech.push(PartOfSpeech.Adjective);
                            break;
                    }
                }               

                curSymbol = this.lexAnalyzer.nextSym();
                while (curSymbol === CAFETIERELexeme.AlternativeOperator) {
                    curSymbol = this.lexAnalyzer.nextSym();
                    if (curSymbol !== CAFETIERELexeme.Noun && curSymbol !== CAFETIERELexeme.Prepositional
                        && curSymbol !== CAFETIERELexeme.Verb && curSymbol !== CAFETIERELexeme.Adverb
                        && curSymbol !== CAFETIERELexeme.Adjective) {
                        this.createError(ErrorCode.UnexpectedCharacter);
            
                        while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                            curSymbol = this.lexAnalyzer.nextSym();
                        }

                        return curSymbol;
                    } else {
                        if (propEl !== null)
                        {
                            switch (curSymbol) {
                                case CAFETIERELexeme.Noun:
                                    propEl.partOfSpeech.push(PartOfSpeech.Noun);
                                    break;
                                case CAFETIERELexeme.Prepositional:
                                    propEl.partOfSpeech.push(PartOfSpeech.Prepositional);
                                    break;
                                case CAFETIERELexeme.Verb:
                                    propEl.partOfSpeech.push(PartOfSpeech.Verb);
                                    break;
                                case CAFETIERELexeme.Adverb:
                                    propEl.partOfSpeech.push(PartOfSpeech.Adverb);
                                    break;
                                case CAFETIERELexeme.Adjective:
                                    propEl.partOfSpeech.push(PartOfSpeech.Adjective);
                                    break;
                            }
                        }
                    }

                    curSymbol = this.lexAnalyzer.nextSym();
                }

                if (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    this.createError(ErrorCode.UnexpectedCharacter);
        
                    while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                        curSymbol = this.lexAnalyzer.nextSym();
                    }

                    return curSymbol;
                }                
            }
        }

        return curSymbol;
    }

    analyzeOrthProp(received, postcondition, createEl, prevEl) {
        let propEl = null;
        if (createEl && this.parseState !== 'rule') {
            propEl = new OrthographyConstraintModel(this.globalIndex, this.x, this.y);
            this.x += 75;
            this.y += 75;
            propEl.orthography = [];
            const prevEllll = this.elements[prevEl];
            this.elements[prevEl].aggregation.push(propEl);
            propEl.rels = {
                target: prevEllll.uuid,
                type: 'aggregation'
            };
            this.elements.push(propEl);
            this.globalIndex++;
        }

        let curSymbol = this.lexAnalyzer.nextSym();
        if (curSymbol !== CAFETIERELexeme.Equality) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
        } else {
            curSymbol = this.lexAnalyzer.nextSym();

            if (curSymbol !== CAFETIERELexeme.Lowercase && curSymbol !== CAFETIERELexeme.Capitalized
                 && curSymbol !== CAFETIERELexeme.Uppercase && curSymbol !== CAFETIERELexeme.Multicap
                 && curSymbol !== CAFETIERELexeme.OtherOrth) {
                this.createError(ErrorCode.UnexpectedCharacter);
                
                while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    curSymbol = this.lexAnalyzer.nextSym();
                }
            } else {
                if (propEl !== null) {
                    switch (curSymbol) {
                        case CAFETIERELexeme.Lowercase:
                            propEl.orthography.push(Orthography.Lowercase);
                            break;
                        case CAFETIERELexeme.Capitalized:
                            propEl.orthography.push(Orthography.Capitalized);
                            break;
                        case CAFETIERELexeme.Uppercase:
                            propEl.orthography.push(Orthography.Uppercase);
                            break;
                        case CAFETIERELexeme.Multicap:
                            propEl.orthography.push(Orthography.Multicap);
                            break;
                    }
                }                

                curSymbol = this.lexAnalyzer.nextSym();
                while (curSymbol === CAFETIERELexeme.AlternativeOperator) {
                    curSymbol = this.lexAnalyzer.nextSym();
                    if (curSymbol !== CAFETIERELexeme.Lowercase && curSymbol !== CAFETIERELexeme.Capitalized
                        && curSymbol !== CAFETIERELexeme.Uppercase && curSymbol !== CAFETIERELexeme.Multicap
                        && curSymbol !== CAFETIERELexeme.OtherOrth) {
                        this.createError(ErrorCode.UnexpectedCharacter);
            
                        while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                            curSymbol = this.lexAnalyzer.nextSym();
                        }

                        return curSymbol;
                    } else {
                        if (propEl !== null) {
                            switch (curSymbol) {
                                case CAFETIERELexeme.Lowercase:
                                    propEl.orthography.push(Orthography.Lowercase);
                                    break;
                                case CAFETIERELexeme.Capitalized:
                                    propEl.orthography.push(Orthography.Capitalized);
                                    break;
                                case CAFETIERELexeme.Uppercase:
                                    propEl.orthography.push(Orthography.Uppercase);
                                    break;
                                case CAFETIERELexeme.Multicap:
                                    propEl.orthography.push(Orthography.Multicap);
                                    break;
                            }
                        }
                    }

                    curSymbol = this.lexAnalyzer.nextSym();
                }

                if (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    this.createError(ErrorCode.UnexpectedCharacter);
        
                    while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                        curSymbol = this.lexAnalyzer.nextSym();
                    }

                    return curSymbol;
                }                
            }
        }

        return curSymbol;
    }

    analyzeStringProp(received, postcondition, createEl, prevEl) {
        let propEl = null;
        if (createEl && this.parseState !== 'rule') {
            propEl = new TokenConstraintModel(this.globalIndex, this.x, this.y);
            this.x += 75;
            this.y += 75;
            const prevEllll = this.elements[prevEl];
            this.elements[prevEl].aggregation.push(propEl);
            propEl.rels = {
                target: prevEllll.uuid,
                type: 'aggregation'
            };
            this.elements.push(propEl);
            this.globalIndex++;
        }

        let curSymbol = this.lexAnalyzer.nextSym();
        if (curSymbol !== CAFETIERELexeme.Equality && curSymbol !== CAFETIERELexeme.Unequality) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
        } else {
            curSymbol = this.lexAnalyzer.nextSym();

            if (curSymbol !== CAFETIERELexeme.String) {
                this.createError(ErrorCode.StringExpected);
                
                while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    curSymbol = this.lexAnalyzer.nextSym();
                }
            } else {
                if (propEl !== null) {
                    propEl.value = this.lexAnalyzer.currentString;
                }
                curSymbol = this.lexAnalyzer.nextSym();
                while (curSymbol === CAFETIERELexeme.AlternativeOperator) {
                    if (propEl !== null) {
                        propEl.isRegex = true;
                    }

                    curSymbol = this.lexAnalyzer.nextSym();
                    if (curSymbol !== CAFETIERELexeme.String) {
                        this.createError(ErrorCode.StringExpected);
            
                        while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                            curSymbol = this.lexAnalyzer.nextSym();
                        }

                        return curSymbol;
                    } else {
                        if (propEl !== null) {
                            propEl.value = propEl.value + "|" + this.lexAnalyzer.currentString;
                        }
                    }

                    curSymbol = this.lexAnalyzer.nextSym();
                }

                if (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    this.createError(ErrorCode.UnexpectedCharacter);
        
                    while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                        curSymbol = this.lexAnalyzer.nextSym();
                    }

                    return curSymbol;
                }                
            }
        }

        return curSymbol;
    }

    analyzeNumberProp(received, postcondition, createEl, prevEl) {
        let propEl = null;
        if (createEl && this.parseState !== 'rule') {
            propEl = new MorphologyConstraintModel(this.globalIndex, this.x, this.y);
            this.x += 75;
            this.y += 75;
            propEl.tense = [];
            propEl.person = [];
            propEl.number = [];
            propEl.gender = [];
            propEl.case = [];
            propEl.anima = [];
            this.elements[prevEl].aggregation.push(propEl);
            const prevEllll = this.elements[prevEl];
            propEl.rels = {
                target: prevEllll.uuid,
                type: 'aggregation'
            };
            this.elements.push(propEl);
            this.globalIndex++;
        }

        let curSymbol = this.lexAnalyzer.nextSym();
        if (curSymbol !== CAFETIERELexeme.Equality) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
        } else {
            curSymbol = this.lexAnalyzer.nextSym();

            if (curSymbol !== CAFETIERELexeme.NumberSingle && curSymbol !== CAFETIERELexeme.NumberPlural) {
                this.createError(ErrorCode.UnexpectedCharacter);
                
                while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    curSymbol = this.lexAnalyzer.nextSym();
                }
            } else {
                if (propEl !== null) {
                    const numb = (curSymbol === CAFETIERELexeme.NumberSingle) ? MorphNumber.Singular : MorphNumber.Plural;
                    propEl.number = [numb];
                }
                

                curSymbol = this.lexAnalyzer.nextSym();
                while (curSymbol === CAFETIERELexeme.AlternativeOperator) {
                    curSymbol = this.lexAnalyzer.nextSym();
                    if (curSymbol !== CAFETIERELexeme.NumberSingle && curSymbol !== CAFETIERELexeme.NumberPlural) {
                        this.createError(ErrorCode.UnexpectedCharacter);
            
                        while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                            curSymbol = this.lexAnalyzer.nextSym();
                        }

                        return curSymbol;
                    }

                    curSymbol = this.lexAnalyzer.nextSym();
                }

                if (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    this.createError(ErrorCode.UnexpectedCharacter);
        
                    while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                        curSymbol = this.lexAnalyzer.nextSym();
                    }

                    return curSymbol;
                }                
            }
        }

        return curSymbol;
    }

    analyzeIdentProp(received, postcondition, createEl, prevEl) {
        let propEl;
        if (createEl && this.parseState !== 'rule') {
            propEl = new RuleConstraintModel(this.globalIndex, this.x, this.y);
            this.x += 75;
            this.y += 75;
            this.elements[prevEl].aggregation.push(propEl);
            const prevElllll = this.elements[prevEl];
            propEl.rels = {
                target: prevElllll.uuid,
                type: 'aggregation'
            };
            this.elements.push(propEl);            
            this.globalIndex++;
        }

        const isSem = received === CAFETIERELexeme.SemanticFeature;
        let curSymbol = this.lexAnalyzer.nextSym();
        if (curSymbol !== CAFETIERELexeme.Equality) {
            this.createError(ErrorCode.UnexpectedCharacter);

            while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                curSymbol = this.lexAnalyzer.nextSym();
            }
        } else {
            curSymbol = this.lexAnalyzer.nextSym();

            if (curSymbol !== CAFETIERELexeme.Identifier) {
                this.createError(ErrorCode.IdentifierExpected);
                
                while (postcondition.indexOf(curSymbol) === -1 && curSymbol !== '<EOF>') {
                    curSymbol = this.lexAnalyzer.nextSym();
                }
            } else {
                const str = this.lexAnalyzer.currentString;
                if (isSem && this.parseState === 'rule') {                    
                    this.elements[this.elements.length - 1].name = str;
                }
                if (propEl) {
                    propEl.rule = str;
                }                
                curSymbol = '';
            }
        }

        return curSymbol;
    }
}