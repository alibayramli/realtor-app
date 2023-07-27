import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninParams, SignupParams } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(
    { name, email, phone, password }: SignupParams,
    userType: UserType,
  ) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException();
    }
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: userType,
      },
    });

    return this.generateJWT(name, user.id);
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    const hashedPassword = user.password;

    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', 400);
    }

    return this.generateJWT(user.name, user.id);
  }

  private generateJWT(name: string, id: number) {
    const tokenExpinSeconds = 3600000;
    return jwt.sign(
      {
        name,
        id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: tokenExpinSeconds,
      },
    );
  }

  async generateProductKey(email, userType) {
    const saltRound = 10;
    const keyToHash = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    return bcrypt.hash(keyToHash, saltRound);
  }
}
