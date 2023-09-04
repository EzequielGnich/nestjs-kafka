import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderDto } from '../dtos/order';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderStatus } from '.prisma/client/orders';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Get()
	getAll() {
		return this.ordersService.getAll();
	}

	@Post()
	create(@Body() data: OrderDto) {
		return this.ordersService.create(data);
	}

	@MessagePattern('payments')
	async complete(@Payload() message) {
		console.log(message);
		const status =
			message.status === 'APPROVED' ? OrderStatus.PAYDE : OrderStatus.CANCELLED;

		const order = await this.ordersService.complete(message.order_id, status);

		return order;
	}
}
