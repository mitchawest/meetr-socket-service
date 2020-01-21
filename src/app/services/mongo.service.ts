import MongoDb from '@model/mongo.model';
import { InsertOneWriteOpResult, InsertWriteOpResult, DeleteWriteOpResultObject, UpdateWriteOpResult } from 'mongodb';

class MongoService {
    db: MongoDb['db'];
    init = async () => {
        this.db = await new MongoDb(process.env.MONGO_URL, process.env.MONGO_USER, process.env.MONGO_PASSWORD).connect(process.env.MONGO_DB);
    };
    get = (collectionStr: string, query?: object): Promise<any[]> =>
        new Promise((resolve, reject) => {
            this.db.collection(collectionStr, (err, collection) => {
                if (err) reject(err);
                const cursor = collection.find(query);
                cursor
                    .toArray()
                    .then(response => {
                        resolve(response);
                    })
                    .catch(err => reject(err));
            });
        });
    set = (collectionStr: string, payload: object | object[]): Promise<InsertOneWriteOpResult<any> | InsertWriteOpResult<any>> =>
        new Promise((resolve, reject) => {
            this.db.collection(collectionStr, (err, collection) => {
                if (err) reject(err);
                if (payload && Array.isArray(payload)) {
                    collection.insertMany(payload, (err, res) => {
                        if (err) reject(err);
                        resolve(res);
                    });
                } else {
                    collection.insertOne(payload, (err, res) => {
                        if (err) reject(err);
                        resolve(res);
                    });
                }
            });
        });
    update = (collectionStr: string, where: object, payload: object): Promise<UpdateWriteOpResult> =>
        new Promise((resolve, reject) => {
            this.db.collection(collectionStr, (err, collection) => {
                if (err) reject(err);
                collection.updateOne(where, payload, (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
            });
        });
    delete = (collectionStr: string, where: object): Promise<DeleteWriteOpResultObject> =>
        new Promise((resolve, reject) => {
            this.db.collection(collectionStr, (err, collection) => {
                if (err) reject(err);
                collection.deleteMany(where, (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
            });
        });
}

const mongoService = new MongoService();

export default mongoService;
