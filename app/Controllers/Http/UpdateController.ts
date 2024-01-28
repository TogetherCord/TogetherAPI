// app/Controllers/Http/UpdateController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import Drive from '@ioc:Adonis/Core/Drive'
import fs from 'fs';
import path from 'path';

export default class UpdateController {
    public async pushupdate({ request, response }: HttpContextContract) {
        const updateFile = request.file('update')

        if (!updateFile) {
            return response.badRequest('File not provided')
        }

        try {
            const tmpPath = Application.tmpPath('Update');

            await updateFile.move(tmpPath);

            const versionFilePath = path.resolve(tmpPath, 'version.json');
            const versionData = fs.readFileSync(versionFilePath, 'utf-8');

            let versionObj = JSON.parse(versionData);

            let versionParts = versionObj.version.split('.');
            versionParts[1] = (parseInt(versionParts[1]) + 1).toString();
            versionObj.version = versionParts.join('.');

            const updatedVersionData = JSON.stringify(versionObj, null, 2);

            fs.writeFileSync(versionFilePath, updatedVersionData);

            return response.ok({ message: 'File uploaded and version updated successfully' })
        } catch (error) {
            console.error(error)
            return response.internalServerError('Could not upload file or update version')
        }
    }

    public async getupdate({ response }: HttpContextContract) {
        const tmpPath = Application.tmpPath('Update');
        const indexFilePath = path.resolve(tmpPath, 'index.js');

        if (!fs.existsSync(indexFilePath)) {
            return response.status(404).send('File not found');
        }

        response.attachment(indexFilePath);
    }

    public async getversion({ response }: HttpContextContract) {
        const tmpPath = Application.tmpPath('Update');
        const versionFilePath = path.resolve(tmpPath, 'version.json');

        if (!fs.existsSync(versionFilePath)) {
            return response.status(404).send('File not found');
        }

        response.ok(fs.readFileSync(versionFilePath, 'utf-8'));
    }
}
