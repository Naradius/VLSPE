import {Enum} from 'enumify';
import { ErrorCode } from './error';

export class CAFETIERELexeme extends Enum {}
CAFETIERELexeme.initEnum(['AnnotationBegin', 'AnnotationEnd', 'SemanticFeature', 
    'Equality', 'RuleSymbol', 'RulePrecondition', 'RulePostcondition', 'Identifier',
    'SyntacticFeature', 'Noun', 'Prepositional', 'Verb', 'Adverb', 'Adjective',
    'TokenFeature', 'Variable', 'AlternativeOperator', 'FeatureDelimiter',
    'AnnotationGroupBegin', 'AnnotationGroupEnd', 'RuleEnd', 
    'OneOrMore', 'ZeroOrOne', 'ZeroOrMore', 'UserRepetitionStart', 'UserRepetitionEnd',
    'UserRepetitionNumber', 'StringQuotes', 'String',
    'OrthFeature', 'POSFeature', 'LemFeature',
    'LookupFeature', 'IdFeature', 'Lowercase', 'Capitalized',
    'OtherOrth', 'Multicap', 'Uppercase', 'Unequality',
    'SectorFeature', 'LocationFeature', 'ZoneFeature',
    'NumberFeature', 'NumberSingle', 'NumberPlural', 'FirstName', 'SurName', 'WrongCharacter']);

export default class CAFETIERELexAnalyzer {
    constructor(ioModule) {
        this.ioModule = ioModule;
        this.currentString = '';
        this.currentNumber = 0;

        this.keywords = {
            'sem': CAFETIERELexeme.SemanticFeature,
            'syn': CAFETIERELexeme.SyntacticFeature,
            'np': CAFETIERELexeme.Noun,
            'nn': CAFETIERELexeme.Noun,
            'nnp': CAFETIERELexeme.Noun,
            'prp': CAFETIERELexeme.Prepositional,
            'vb': CAFETIERELexeme.Verb,
            'vbd': CAFETIERELexeme.Verb,
            'vbg': CAFETIERELexeme.Verb,
            'vbn': CAFETIERELexeme.Verb,
            'vbp': CAFETIERELexeme.Verb,
            'vbz': CAFETIERELexeme.Verb,
            'rb': CAFETIERELexeme.Adverb,
            'jj': CAFETIERELexeme.Adjective,
            'token': CAFETIERELexeme.TokenFeature,
            'orth': CAFETIERELexeme.OrthFeature,
            'lem': CAFETIERELexeme.LemFeature,
            'stem': CAFETIERELexeme.LemFeature,
            'lookup': CAFETIERELexeme.LookupFeature,
            'id': CAFETIERELexeme.IdFeature,
            'lowercase': CAFETIERELexeme.Lowercase,
            'capitalized': CAFETIERELexeme.Capitalized,
            'uppercase': CAFETIERELexeme.Uppercase,
            'multicap': CAFETIERELexeme.Multicap,
            'caphyphenated': CAFETIERELexeme.OtherOrth,
            'upperinitial': CAFETIERELexeme.OtherOrth,
            'lhyphenated': CAFETIERELexeme.OtherOrth,
            'upperdotted': CAFETIERELexeme.OtherOrth,
            'initial': CAFETIERELexeme.OtherOrth,
            'initialdot': CAFETIERELexeme.OtherOrth,
            'arithmetic': CAFETIERELexeme.OtherOrth,
            'doublequote': CAFETIERELexeme.OtherOrth,
            'apostrophe': CAFETIERELexeme.OtherOrth,
            'number': CAFETIERELexeme.OtherOrth,
            'punct': CAFETIERELexeme.OtherOrth,
            'bracket': CAFETIERELexeme.OtherOrth,
            'other': CAFETIERELexeme.OtherOrth,
            'sector': CAFETIERELexeme.SectorFeature,
            'loc': CAFETIERELexeme.LocationFeature,
            'zone': CAFETIERELexeme.ZoneFeature,
            'num': CAFETIERELexeme.NumberFeature,
            'sg': CAFETIERELexeme.NumberSingle,
            'pl': CAFETIERELexeme.NumberPlural,
            'firstname': CAFETIERELexeme.FirstName,
            'surname': CAFETIERELexeme.SurName
        };
    }

    nextSym() {
        this.currentString = '';
        const peekd = this.ioModule.nextChar(true) || '<EOF>';
        if (peekd === '<EOF>') return '<EOF>';

        const curChar = this.ioModule.nextChar() || '<EOF>';
        let curSymbol = '';

        switch (curChar) {            
            case '\n': 
            case '\r':
            case ' ': return this.nextSym();
            case '<EOF>': return curChar;
            case '[': curSymbol = CAFETIERELexeme.AnnotationBegin; break;
            case ']': curSymbol = CAFETIERELexeme.AnnotationEnd; break;
            case '!':
                let peeked1 = this.ioModule.nextChar(true);
                if (peeked1 === '=') {
                    this.ioModule.nextChar();
                    curSymbol = CAFETIERELexeme.Unequality;
                } else {
                    this.ioModule.createError(ErrorCode.UnexpectedCharacter);
                    return;
                }
                break;
            case '=': 
                let peeked2 = this.ioModule.nextChar(true);
                if (peeked2 === '>') {
                    this.ioModule.nextChar();
                    curSymbol = CAFETIERELexeme.RuleSymbol;
                } else {
                    curSymbol = CAFETIERELexeme.Equality;
                }
                break;
            case '\\': curSymbol = CAFETIERELexeme.RulePrecondition; break;
            case '/': curSymbol = CAFETIERELexeme.RulePostcondition; break;
            case '|': curSymbol = CAFETIERELexeme.AlternativeOperator; break;
            case '"':
                let peeked3 = this.ioModule.nextChar(true);
                let symbolChr = '';
                let isWrong = peeked3 === '<EOF>' || peeked3 === '\n' || peeked3 === '\r';
                let isQuote = peeked3 === '"';

                if (isWrong) {
                    curSymbol = CAFETIERELexeme.StringQuotes;
                    this.ioModule.createError(ErrorCode.UnexpectedEndOfString);
                    return curSymbol;
                } else if (isQuote) {
                    this.ioModule.nextChar();
                    curSymbol = CAFETIERELexeme.String;
                } else {
                    while (!isWrong && !isQuote) {
                        symbolChr += peeked3;
                        peeked3 = this.ioModule.nextChar(true);
                        isWrong = peeked3 === '<EOF>' || peeked3 === '\n' || peeked3 === '\r';
                        isQuote = peeked3 === '"';
    
                        if (isWrong) {
                            curSymbol = CAFETIERELexeme.StringQuotes;
                            this.ioModule.createError(ErrorCode.UnexpectedEndOfString);
                            return curSymbol;
                        } else if (isQuote) {
                            this.ioModule.nextChar();
                            curSymbol = CAFETIERELexeme.String;
                        } else {
                            this.currentString += peeked3;
                            this.ioModule.nextChar();
                        }                      
                    }
                }
                break;
            case ';': curSymbol = CAFETIERELexeme.RuleEnd; break;
            case ',': curSymbol = CAFETIERELexeme.FeatureDelimiter; break;
            case '(': curSymbol = CAFETIERELexeme.AnnotationGroupBegin; break;
            case ')': curSymbol = CAFETIERELexeme.AnnotationGroupEnd; break;
            case '+': curSymbol = CAFETIERELexeme.OneOrMore; break;
            case '?': curSymbol = CAFETIERELexeme.ZeroOrOne; break;
            case '*': curSymbol = CAFETIERELexeme.ZeroOrMore; break;
            case '{': curSymbol = CAFETIERELexeme.UserRepetitionStart; break;
            case '}': curSymbol = CAFETIERELexeme.UserRepetitionEnd; break;
            default: break;
        }

        if (curSymbol === '') {
            let iterChar = curChar;
            let symbolChars = '';

            let isDigit = iterChar.search(/\d/) !== -1;

            if (isDigit) {
                while (isDigit) {
                    symbolChars += iterChar;
                    iterChar = this.ioModule.nextChar(true);
                    isDigit = iterChar.search(/\d/) !== -1;

                    if (isDigit) {
                        this.ioModule.nextChar();
                    }
                }
                this.currentNumber = parseInt(symbolChars);
                curSymbol = CAFETIERELexeme.UserRepetitionNumber;
            } else {
                let isLetter = iterChar.search(/[A-Za-z_]/) !== -1; 

                if (isLetter) {                
                    while (isLetter) {
                        symbolChars += iterChar;
                        iterChar = this.ioModule.nextChar(true);
                        isLetter = iterChar.search(/[A-Za-z_]/) !== -1;

                        if (iterChar === '<EOF>')
                            break;

                        if (isLetter) {
                            this.ioModule.nextChar();
                        }
                    }

                    const keyword = this.keywords[symbolChars.toLowerCase()];
                    if (!!keyword) {
                        curSymbol = keyword;
                    } else {
                        curSymbol = CAFETIERELexeme.Identifier;
                        this.currentString = symbolChars;
                    }
                }
            }            
        }

        if (curSymbol === '') {
            curSymbol = CAFETIERELexeme.WrongCharacter;
        }
        
        return curSymbol;
    }
}