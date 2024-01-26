import { Validators } from "../../../config";
import { LoginUserDto } from "../auth/login-user.dto";



export class CreateProductDto {
    private constructor(
        public readonly name: string,
        public readonly available: boolean,
        public readonly price: number,
        public readonly description: string,
        public readonly user: string, // ID
        public readonly category: string, //ID
    ) {

    }

    static create(props: { [key: string]: any }): [string?, CreateProductDto?] {
        const {
            name,
            available,
            price,
            description,
            user,
            category
        } = props;

        if (!name) return ['Missing Name']
        if (!user) return ['Missing User']
        if (!Validators.isMongoID(user)) return ['Invalid User ID'];
        if (!category) return ['Missing Category']
        if (!Validators.isMongoID(category)) return ['Invalid Category ID'];

        return [undefined, new CreateProductDto(name, !!available, price, description, user, category)]
    }
}