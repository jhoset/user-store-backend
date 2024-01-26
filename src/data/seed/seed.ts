import { envs } from "../../config";
import { CategoryModel } from "../mongo/models/category.model";
import { ProductModel } from "../mongo/models/product.model";
import { UserModel } from "../mongo/models/user.model";
import { MongoDatabase } from "../mongo/mongo-database";
import { seedData } from "./data";

(async () => {

    await MongoDatabase.connect({
        dbName: envs.MONGO_DB_NAME,
        mongoUrl: envs.MONGO_URL
    })
    await main();


    await MongoDatabase.disconnect();
})();



const random0andX = (x: number) => {
    return Math.floor(Math.random() * x);
}


async function main() {

    //! BORRAR TODO
    await Promise.all([
        UserModel.deleteMany(),
        CategoryModel.deleteMany(),
        ProductModel.deleteMany(),
    ])
    //* CREAR USUARIOS
    const users = await UserModel.insertMany(seedData.users);
    //* CREAR CATEGORIAS
    const categories = await CategoryModel.insertMany(
        seedData.categories.map(category => {
            return {
                ...category,
                user: users[0]._id
            }
        })
    )

    //* CREAR PRODUCTOS
    const products = await ProductModel.insertMany(
        seedData.products.map(product => {
            return {
                ...product,
                user: users[random0andX(users.length - 1)]._id,
                category: categories[random0andX(categories.length - 1)]._id
            }
        })
    )

    console.log(">>> Database seeded!")
}