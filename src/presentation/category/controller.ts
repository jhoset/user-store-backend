import { Request, Response } from "express";
import { CreateCategoryDto, CustomError, PaginationDto } from "../../domain";
import { CategoryService } from "../services/category.service";

export class CategoryController {

    //DI
    constructor(private readonly categoryService: CategoryService) {

    }



    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message })
        }

        console.error(`${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }

    public createCategory = async (req: Request, res: Response) => {
        const [error, createCategoryDto] = CreateCategoryDto.create(req.body);
        if (error) return res.status(400).json({ error })
        this.categoryService.createCategory(createCategoryDto!, req.body.user)
            .then(cat => res.status(201).json(cat))
            .catch(err => this.handleError(err, res));
    }

    public getCategories = async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit)
        if (error) return res.status(400).json({ error });

        this.categoryService.getCategories(paginationDto!)
            .then(categories => res.status(200).json(categories))
            .catch(err => this.handleError(err, res));
    }
}