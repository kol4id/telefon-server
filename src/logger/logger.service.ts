import { ConsoleLogger, Injectable, LoggerService } from "@nestjs/common";
import pino, { levels } from "pino";
import pinoPretty from "pino-pretty";

@Injectable()
export class Logger extends ConsoleLogger{
    constructor(){
        super();
        this.logger.level = process.env.NODE_ENV == 'prod' ? 'warn' : 'debug';
    }
    private readonly logger = pino(
        pinoPretty({
            colorize: true,
            translateTime: true,
        })     
    )

    private getMessage(message: any, context?: string){
        return context ? `[${context}] ${message}` : message
    }

    log(message: any, ...optionalParams: any[]) {
        this.logger.info(this.getMessage(message, ...optionalParams));
    }

    error(message: any, stack?: string, context?: string) {
        this.logger.error(this.getMessage(message, context));
        if (stack){
            this.logger.error(stack);
        }  
    }

    warn(message: any, ...optionalParams: any[]) {
        this.logger.warn(this.getMessage(message, ...optionalParams));
    }

    debug(message: any, ...optionalParams: any[]) {
        let msg;
        if (message !== null && typeof message === 'object'){
            msg = JSON.stringify(message, null, 2);
        }
        this.logger.debug(this.getMessage(msg ?? message, ...optionalParams));
    }

    verbose(message: any, ...optionalParams: any[]) {
        this.logger.trace(this.getMessage(message, ...optionalParams));
    }
}



