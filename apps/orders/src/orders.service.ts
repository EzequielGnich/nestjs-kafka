import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma/prisma.service';
import { OrderDto } from '../dtos/order';
import { OrderStatus } from '.prisma/client/orders';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
	constructor(
		private readonly prismaService: PrismaService,

		@Inject('ORDERS_SERVICE')
		private readonly kafkaClient: ClientKafka,
	) {}
	getAll() {
		return this.prismaService.order.findMany();
	}

	async create(data: OrderDto) {
		const order = await this.prismaService.order.create({
			data: {
				...data,
				status: OrderStatus.PENDING,
			},
		});

		await lastValueFrom(this.kafkaClient.emit('orders', order));

		return order;
	}

	async complete(id: number, status: OrderStatus) {
		const order = await this.prismaService.order.update({
			where: { id },
			data: { status },
		});

		return order;
	}
}
