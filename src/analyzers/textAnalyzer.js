import IOModule from "./iomodule";
import CAFETIERESemAnalyzer from "./cafetiereSemAnalyzer.js";
import LSPLParser from "./lsplParser.js";

export default class TextAnalyzer {
    constructor(file, type) {
        switch (type) {
            case "cafetiere":
                this.symbolList = "";
                this.ioModule = new IOModule(file);
                this.processor = new CAFETIERESemAnalyzer(this.ioModule);
                break;
            case "lspl":
                this.processor = new LSPLParser(file);
                break;
        }
    }

    process() {
        const result = this.processor.process();
        this.hasErrors = !!this.processor.exception;
        this.exception = this.processor.exception;

        return result;
    }
}