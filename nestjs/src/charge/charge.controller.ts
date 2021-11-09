import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import CreateChargeDto from './dto/createCharge.dto';
import RequestWithUser from '../authentication/requestWithUser.interface';
import StripeService from '../stripe/stripe.service';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt-authentication.guard';

@Controller('charge')
export default class ChargeController {
  constructor(
    private readonly stripeService: StripeService
  ) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createCharge(@Body() charge: CreateChargeDto, @Req() request: RequestWithUser) {
    return this.stripeService.charge(charge.amount, charge.paymentMethodId, request.user.stripeCustomerId);
  }
}
