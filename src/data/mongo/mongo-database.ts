import mongoose from "mongoose";

interface ConnectionOptions {
    mongoUrl: string;
    dbName: string;
}

export class MongoDatabase {


    static async connect(options: ConnectionOptions) {
        const { mongoUrl, dbName } = options;

        try {
            await mongoose.connect(mongoUrl, {
                dbName: dbName
            })
            console.log('Mongo DB Connected!')
            return true;
        } catch (error) {
            console.log("Mongo Connection Error");
            throw error;
        }

    }

    static async disconnect() {
        await mongoose.disconnect();
    }

}