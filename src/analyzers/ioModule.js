import Error from "./error.js";

export default class IOModule {
    constructor(file) {
        this.file = file.split("\n");
        this.buffer = (file.length > 0) ? this.file[0] : "";
        this.listing = "";
        this.lineNumber = 0;
        this.positionNumber = 0;
        this.errors = [];
        this.prevPos = 0;
    }

    createAfterlineError(lineNumber, positionNumber, errorCode) {
        const error = new Error(this.lineNumber, this.prevPos, errorCode);
        this.listing += "\n semantic error: " + error.errorText + " line: " + lineNumber + "; position: " + positionNumber;
    }
    
    createError(lineNumber, positionNumber, errorCode) {
        const error = new Error(lineNumber, positionNumber, errorCode);
        this.errors.push(error);

        return error;
    }

    createError(errorCode) {
        const error = new Error(this.lineNumber, this.prevPos, errorCode);
        this.errors.push(error);

        return error;
    }

    printLineToListing() {
        this.listing += "\n" + (this.lineNumber + 1).toString() + "\t" + this.buffer;
    }

    printErrorsToListing() {
        this.errors.filter(error => {
            return error.lineNumber === this.lineNumber;
        }).forEach(error => {
            const spaces = " ".repeat(error.positionNumber);
            this.listing += "\n***\t" + spaces + "^ error " + error.errorText;
        });
    }

    nextChar(peekOnly) {
        if (this.buffer == undefined) {
            return '<EOF>';
        }

        if (this.buffer.length === this.positionNumber) {
            if (peekOnly) {
                const line = this.file[this.lineNumber + 1];
                if (this.file.length - this.lineNumber - 1 <= 0) {
                    return '<EOF>';
                } else {
                    return line[0];
                }
            } else {
                this.printLineToListing();
                this.printErrorsToListing();
                this.lineNumber++;

                this.buffer = this.file[this.lineNumber];
                this.positionNumber = 0;

                if (this.file.length - this.lineNumber <= 0) {
                    return '<EOF>';
                }
            }
        }

        const curChar = this.buffer[this.positionNumber];

        if (!peekOnly) {
            this.prevPos = this.positionNumber;
            this.positionNumber++;
        }
        
        return curChar;
    }
}