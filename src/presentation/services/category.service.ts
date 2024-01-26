import { CategoryModel } from "../../data";
import { CreateCategoryDto, CustomError, PaginationDto, UserEntity } from "../../domain";






export class CategoryService {

    //DI
    constructor(

    ) {

    }


    async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity) {
        const categoryExists = await CategoryModel.findOne({ name: createCategoryDto.name });
        if (categoryExists) throw CustomError.badRequest("Category already exists")

        try {
            const category = new CategoryModel({
                ...createCategoryDto,
                user: user.id
            })

            await category.save();
            return {
                id: category.id,
                name: category.name,
                available: category.available
            }

        } catch (error) {
            throw CustomError.internalServer(`|||  CategoryService: ${error}`);
        }
    }

    async getCategories(paginationDto: PaginationDto) {

        const { page, limit } = paginationDto;

        try {
            // const total = await CategoryModel.countDocuments();
            // const categories = await CategoryModel.find()
            //     .skip((page - 1) * limit)
            //     .limit(limit);
            const [total, categories] = await Promise.all([
                await CategoryModel.countDocuments(),
                await CategoryModel.find().skip((page - 1) * limit).limit(limit)
            ])


            const categoriesMapped = categories.map((cat) => ({ id: cat.id, name: cat.name, available: cat.available }))
            return {
                pagination: {
                    total: total,
                    page: page,
                    limit: limit,
                    next: page*limit <= total ? `/api/categories?page=${page + 1}&limit=${limit}`: null,
                    prev: page-1 > 0 ?  `/api/categories?page=${page - 1}&limit=${limit}` : null,
                },
                categories: categoriesMapped,

            };
        } catch (error) {
            throw CustomError.internalServer(`|||  CategoryService: ${error}`);
        }
    }
}