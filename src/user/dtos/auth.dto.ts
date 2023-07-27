import { UserType } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';

export interface SignupParams {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface SigninParams {
  email: string;
  password: string;
}

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @Matches(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;

  @IsString()
  @MinLength(5)
  password: string;

  @IsOptional()
  productKey?: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class GenerateProductKeyDto {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}
