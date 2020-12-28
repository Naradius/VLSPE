import {Enum} from 'enumify';

export class ErrorCode extends Enum {}
ErrorCode.initEnum(['UnexpectedCharacter', 'UnexpectedEndOfString', 'UnexpectedEndOfFile', 'NonClosedAnnotationGroup',
    'UnexpectedAnnotationGroupEnd', 'UnexpectedPropertyType', 'NonClosedAnnotation', 'NonClosedRule', 'BracketMismatch',
    'RuleExpected', 'IdentifierExpected', 'StringExpected', 'AnnotationExpected', 'MinRepetitionGreater']);

export default class Error {
    get errorText() {
        return Error.getErrorTextByCode(this.errorCode);
    }
    
    constructor(lineNumber, positionNumber, errorCode) {
        this.lineNumber = lineNumber;
        this.positionNumber = positionNumber;
        this.errorCode = errorCode;
    }

    static getErrorTextByCode(errorCode) {
        switch (errorCode) {
            case ErrorCode.UnexpectedCharacter:
                return "Unexpected character.";
            case ErrorCode.UnexpectedEndOfString:
                return 'Unexpected end of string.';
            case ErrorCode.NonClosedAnnotationGroup:
                return 'Non-closed annotation group.';
            case ErrorCode.UnexpectedAnnotationGroupEnd:
                return 'Unexpected annotation group end.';
            case ErrorCode.UnexpectedPropertyType:
                return 'Unexpected property type.';
            case ErrorCode.NonClosedAnnotation:
                return 'Non-closed annotation.';
            case ErrorCode.NonClosedRule:
                return 'Non-closed rule.';
            case ErrorCode.UnexpectedEndOfFile:
                return 'Unexpected end of file.';
            case ErrorCode.BracketMismatch:
                return 'Bracket mismatch.';
            case ErrorCode.RuleExpected:
                return 'Rule expected.';
            case ErrorCode.IdentifierExpected:
                return 'Identifier expected.';
            case ErrorCode.StringExpected:
                return 'String expected.';
            case ErrorCode.AnnotationExpected:
                return 'Annotation expected.';
            case ErrorCode.MinRepetitionGreater:
                return 'Min repetition is greater than max repetition.';
            default:
                return "Unknown error.";
        };
    }
}