import { IsEmail, IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()  
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(/^\+[1-9]\d{1,14}$/)
  phoneNumber: string;
}

export default RegisterDto;