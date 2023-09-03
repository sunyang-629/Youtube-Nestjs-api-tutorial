import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('users')
export class UserController {
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  //**? appended user to request on jwt.startegy validate(), but why it know user */
  getMe(@Req() req: Request) {
    return req.user;
  }
}
