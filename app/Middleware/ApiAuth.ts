import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class ApiAuth {
  public async handle ({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const userApiKey = request.header('x-api-key');
    const serverApiKey = Env.get('APP_KEY');

    if (userApiKey && userApiKey === serverApiKey) {
      await next();
    } else {
      return response.status(403).json({ error: `That's sad for you but.. YOU CANT USE THIS GO AWAY SKIDDOS` });
    }
  }
}
