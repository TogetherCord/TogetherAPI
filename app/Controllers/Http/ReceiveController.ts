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
    const userId = request.input('userId');

    if (!file || !userId) {
      return { status: 'error', message: 'No file uploaded or user ID provided' };
    }

    const tmpPath = Application.tmpPath('uploads');
    await file.move(tmpPath);

    const safeFileName = path.basename(file.fileName || 'default.txt');
    const userFileName = `${userId}-friends.json`;
    const fileContent = await readFile(path.join(tmpPath, safeFileName), 'utf8');

    await unlink(path.join(tmpPath, safeFileName));

    const filePath = Application.tmpPath(userFileName);
    await writeFile(filePath, fileContent, 'utf8');

    return { status: 'success' };
  }

  public async download({ request, response }: HttpContextContract) {
    const userId = request.input('userId');

    if (!userId) {
      return response.status(400).send({ status: 'error', message: 'No user ID provided' });
    }

    const userFileName = `${userId}-friends.json`;
    const filePath = Application.tmpPath(userFileName);

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
