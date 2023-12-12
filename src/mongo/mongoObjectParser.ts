import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoParser{

    parse<T>(excludeFields: string[], object: any): Promise<T>{

        const {_id, ...Obj} = JSON.parse(JSON.stringify(object));
        excludeFields.forEach((field) => {
            delete Obj[field];
        });
        return {id: _id, ...Obj}
    }

    async parseArray<T>(excludeFields: string[], objects: any): Promise<T>{

        const result: T = objects.forEach((object)=>{
            return this.parse(excludeFields, object);
        })
        
        return result;
    }

}