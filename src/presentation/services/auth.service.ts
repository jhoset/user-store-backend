import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { EmailService } from "./email.service";
import jwt from "jsonwebtoken";

export class AuthService {
    //DI
    constructor(
        private readonly emailService: EmailService
    ) {

    }

    public async registerUser(registerDto: RegisterUserDto) {
        const existUser = await UserModel.findOne({ email: registerDto.email });
        if (existUser) throw CustomError.badRequest('Email already exists');
        console.log(registerDto)
        try {
            const user = new UserModel(registerDto);

            // * ENCRIPTAR LA CONTRASEÑLA
            user.password = bcryptAdapter.hash(user.password);
            // TODO: Generar JWT <-- Para mantener la autenticacion del usuario
            // TODO: Email de Verificacion
            const userDb = await user.save();

            await this.sendEmailValidationLink(userDb.email);


            const token = await JwtAdapter.generateToken({ id: userDb.id })
            if (!token) throw CustomError.internalServer(`Error while creating JWT`);
            const { password, ...rest } = UserEntity.mapFrom(userDb);
            return { user: rest, token: token };

        } catch (err) {
            console.log("Error")
            console.log(err);
            throw CustomError.internalServer(`${err}`);
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {

        // FindOne para verificar si existe
        const existUser = await UserModel.findOne({ email: loginUserDto.email });
        if (!existUser) throw CustomError.badRequest('There is no user associated to this email!');
        // isMatch, hasMatch... bcrypt... compare( 123456 )
        const match = await bcryptAdapter.compare(loginUserDto.password, existUser?.password)
        if (!match) throw CustomError.badRequest('Email or Password is incorrect!');

        const token = await JwtAdapter.generateToken({ id: existUser.id })
        if (!token) throw CustomError.internalServer(`Error while creating JWT`);

        const { password, ...rest } = UserEntity.mapFrom(existUser);
        return {
            user: { ...rest, token }
        }
    }


    private async sendEmailValidationLink(email: string) {
        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServer(`Error Getting Token`);

        const link = `${envs.WEBSERVIE_URL}/auth/validate-email/${token}`;
        const html = `
            <h1> Validate your email </h1>
            <p> Click on the following link to validate your email:  </p>
            <a href="${link}">Validate Email</a>
        `;

        const options = {
            to: email,
            subject: 'Email Verification',
            htmlBody: html
        }

        const isSent = await this.emailService.sendEmail(options);
        if (!isSent) {
            throw CustomError.internalServer("Error Sending Email");
        }
        return true;
    }
    // ! GENERALMENTE LA DURACION DE UN TOKEN DE VALIDACIO DE EMAIL, 10 o 15minutos
    public async validateEmail(token: string) {
        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.unauthorized('Token not valid');
        const { email } = payload as { email: string };
        if (!email) throw CustomError.internalServer('Email not found');


        const user = await UserModel.findOne({ email });
        if ( !user ) throw CustomError.internalServer('Email not exists');

        user.emailValidated = true;
        await user.save();

        return true;
    }

}