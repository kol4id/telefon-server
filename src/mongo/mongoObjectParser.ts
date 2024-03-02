import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoParser{

    /**
     * @example
     * interface IExample {
     *      a: number,
     *      b: string,
     * }
     * const dirtyObject = {a: 123, b: 'zxv123', c: true, d: Date.now()}
     * const parsedObject = await parse<IExample>(['c','d'], DirtyObject);
     * console.log(parsedObject)
     * //{a: 123, b: 'zxv123'}
     
     * @param excludeFields array of strings with object's fields name to exclude. 
     * @param object object to exclude from
     */
    async parse<T>(excludeFields: string[], object: any): Promise<T>{
        const {_id, ...Obj} = JSON.parse(JSON.stringify(object));
        excludeFields.forEach((field) => {
            delete Obj[field];
        });
        return {id: _id, ...Obj}
    }

    /**
     * @example
     * interface IExample {
     *      a: number,
     *      b: string,
     * }
     * const dirtyObject = [{a: 123, b: 'zxv123', c: true, d: Date.now()}, {a: 124, b: 'zxv124', c: false, d: Date.now()}, ...]
     * const parsedObject = await parseArray<IExample>(['c','d'], DirtyObject);
     * console.log(parsedObject)
     * //[{a: 123, b: 'zxv123'}, {a: 124, b: 'zxv124'}]
     
     * @param excludeFields array of strings with object's fields name to exclude. 
     * @param object object to exclude from
     */
    async parseArray<T>(excludeFields: string[], objects: any): Promise<T[]>{
        const result: T[] = await Promise.all<T>(
            objects.map(async(object)=>{
                return await this.parse<T>(excludeFields, object);
            })   
        );

        return result;
    }

}