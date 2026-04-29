import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/utils/response.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return successResponse(result, 'Login successful');
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@CurrentUser('sub') userId: string) {
    const profile = await this.authService.getProfile(userId);
    return successResponse(profile);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout() {
    return successResponse(null, 'Logged out successfully');
  }
}
