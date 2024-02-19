// app/Controllers/Http/PingController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon';

export default class PingController {
  public async handle({ response }: HttpContextContract) {
    const start = DateTime.now();
    const end = DateTime.now();
    const duration = end.diff(start, 'milliseconds');

    return response.send({ status: 'pong', duration: duration.milliseconds });
  }
}
