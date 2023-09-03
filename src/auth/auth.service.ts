import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    //** generate the password has */
    const hash = await argon.hash(dto.password);
    //** save the new user in the db */
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;
      //** return the saved user */
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    let pwMatches: boolean;
    try {
      //** find the user by email */
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { email: dto.email },
      });

      //** compare password */
      pwMatches = await argon.verify(user.hash, dto.password);
      if (!pwMatches) throw new ForbiddenException('Credential incorrect');

      //** send back the user */
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        //** if user does not exist throw exception */
        if (error.code === 'P2025') {
          throw new ForbiddenException('Credentials incorrrect');
        }
      }
      throw error;
    }
  }
}
