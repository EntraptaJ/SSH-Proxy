// src/Library/Logger.ts
export enum LogMode {
    DEBUG,
    INFO,
    WARN,
    ERROR
}


export class Logger {
    public logMode: LogMode;

    constructor() {
        this.logMode = LogMode[process.env.LOG_MODE] ?? LogMode.INFO
    }
    
    public log(mode: LogMode, msg: string, ...args: any[]): void {
        if (mode < this.logMode) {
            return;
        }

        switch (mode) {
            case LogMode.DEBUG:
                console.debug(msg, ...args);
                break;
            case LogMode.INFO:
                console.info(msg, ...args);
                break;
            case LogMode.WARN:
                console.warn(msg, ...args);
                break;
            case LogMode.ERROR:
                console.error(msg, ...args);
                break;
        }
    }

}

export const logger = new Logger()