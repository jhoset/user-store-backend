import { Request, Response } from "express";

import fs from 'fs';
import path from 'path';



export class ImageController {


    constructor() {

    }


    getImage = (req: Request, res: Response) => {
        const { type = '', img = '' } = req.params;

        const imgPath = path.resolve(__dirname, `../../../uploads/${type}/${img}`);
        console.log(imgPath);
        if (!fs.existsSync(imgPath)) {
            return res.status(404).json({ error: 'Image Not found' })
        }

        res.sendFile(imgPath);


    }


}