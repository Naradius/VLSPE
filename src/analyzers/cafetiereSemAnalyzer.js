import CAFETIERESynAnalyzer from './cafetiereSynAnalyzer.js';
import { ErrorCode } from './error.js';

export default class CAFETIERESemAnalyzer {
    constructor(ioModule) {
        this.ioModule = ioModule;
        this.synAnalyzer = new CAFETIERESynAnalyzer(this.ioModule);
    }

    process() {
        this.synAnalyzer.process();
        this.elements = this.synAnalyzer.elements;
        this.hasErrors = this.synAnalyzer.hasErrors;

        if (this.hasErrors) {
            this.exception = this.ioModule.listing;
        }

        this.checkRepetitions();

        return (this.hasErrors) ? [] : this.elements;
    }

    createError(errCode, line, pos) {
        this.ioModule.createAfterlineError(line, pos, errCode);
        this.hasErrors = true;
        this.exception = this.ioModule.listing;
    }

    checkRepetitions() {
        const this1 = this;
        this.elements.filter(function (x, i) {
            return x.type === 'RepetitionPatternModel' && x.minRepetition > x.maxRepetition;
        }).forEach(function (x, i) {
            this1.createError(ErrorCode.MinRepetitionGreater, x.ioLine, x.ioPos);
        });
    }
}