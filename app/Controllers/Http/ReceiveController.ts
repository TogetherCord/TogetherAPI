// app/Controllers/Http/ReceiveController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs';
import { promisify } from 'util';
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
import path from 'path'

export default class ReceiveController {
  public async upload({ request }: HttpContextContract) {
    const file = request.file('file');

    if (!file) {
      return { status: 'error', message: 'No file uploaded' };
    }

    const tmpPath = Application.tmpPath('uploads');
    await file.move(tmpPath);

    const safeFileName = path.basename(file.fileName || 'default.txt');
    const fileContent = await readFile(path.join(tmpPath, safeFileName), 'utf8');

    await unlink(path.join(tmpPath, safeFileName));

    const filePath = Application.tmpPath('friends.json');
    await writeFile(filePath, fileContent, 'utf8');

    return { status: 'success' };
  }

  public async download({ response }: HttpContextContract) {
    const filePath = Application.tmpPath('friends.json');

    try {
      await access(filePath);
    } catch {
      return response.status(404).send({ status: 'error', message: 'File not found' });
    }

    const fileStream = fs.createReadStream(filePath);

    response.stream(fileStream);

    fileStream.on('end', async () => {
      try {
        await unlink(filePath);
      } catch (err) {
        console.error(`Failed to delete file: ${err}`);
      }
    });
  }
}
