import mongodb, { MongoClientOptions, Db, MongoClient } from 'mongodb';

/* Creates basic mongo object and adds connect method. Connection requires specific database name */
export default class MongoDb {
    private client: MongoClient;
    private db: Db;

    constructor(private url: string, private user?: string, private password?: string) {}

    connect = (db: string): Promise<Db> =>
        new Promise((resolve, reject) => {
            let options: MongoClientOptions = { useUnifiedTopology: true };
            if (this.user && this.password) {
                options = {
                    auth: {
                        user: this.user,
                        password: this.password
                    }
                };
            }
            mongodb
                .connect(this.url, options || undefined)
                .then(client => {
                    this.client = client;
                    this.db = this.client.db(db);
                    resolve(this.db);
                })
                .catch(err => reject(err));
        });
}
