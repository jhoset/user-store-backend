import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";
export interface ITokenPayload {
    id: string,
}


export class AuthMiddleware {


    static async validateJWT(req: Request, res: Response, next: NextFunction) {
        const authorization = req.header('Authorization');
        if (!authorization) return res.status(401).json({ error: 'No token provided' });
        if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Invalid Bearer token provided' })
        const token = authorization.split(' ').at(1) || '';
        try {
            const payload = await JwtAdapter.validateToken<{ id: string }>(token)
            if (!payload) return res.status(401).json({ error: 'Invalid token' });
            const user = await UserModel.findById(payload.id)
            if (!user) return res.status(400).json({ error: 'Invalid token - user' })

            // TODO: Validar si el usuario esta activo
            req.body.user = UserEntity.mapFrom(user);
            next();

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }


}