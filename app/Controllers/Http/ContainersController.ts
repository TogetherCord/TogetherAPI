import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Docker from 'dockerode';

const docker = new Docker();

export default class ContainersController {
  public async create({request}: HttpContextContract) {
    const userToken = request.input('token');
    const discordId = request.input('discordId');
    if (!userToken || !discordId) {
      return {status: 'error', message: 'Token ou ID Discord non fourni'};
    }

    const containerName = `TogetherSelf-${discordId}`;

    const containers = await docker.listContainers({all: true});
    const existingContainer = containers.find(container => container.Names && container.Names.includes('/' + containerName));

    if (existingContainer) {
      return {status: 'error', message: 'Un conteneur avec le même nom existe déjà'};
    }

    try {
      const container = await docker.createContainer({
        name: containerName,
        Image: 'client1-img',
        Env: [`TOKEN=${userToken}`, `DISCORDID=${discordId}`]
      });

      await container.start();

      return {status: 'success', message: 'Container créé et démarré avec succès'};
    } catch (error) {
      console.error(error);
      return {status: 'error', message: 'Erreur lors de la création ou du démarrage du conteneur'};
    }
  }

  public async delete({request}: HttpContextContract) {
    const discordId = request.input('discordId');
    if (!discordId) {
      return {status: 'error', message: 'ID Discord non fourni'};
    }

    const containerName = `TogetherSelf-${discordId}`;

    const containers = await docker.listContainers({all: true});
    const existingContainer = containers.find(container => container.Names && container.Names.includes('/' + containerName));

    if (!existingContainer) {
      return {status: 'error', message: 'Aucun conteneur avec ce nom n\'existe'};
    }

    try {
      const container = docker.getContainer(existingContainer.Id);
      if (existingContainer.State !== 'exited') {
        await container.stop();
      }
      await container.remove();

      return {status: 'success', message: 'Container arrêté et supprimé avec succès'};
    } catch (error) {
      console.error(error);
      return {status: 'error', message: 'Erreur lors de l\'arrêt ou de la suppression du conteneur'};
    }
  }

  public async stop({request}: HttpContextContract) {
    const discordId = request.input('discordId');
    if (!discordId) {
      return {status: 'error', message: 'ID Discord non fourni'};
    }

    const containerName = `TogetherSelf-${discordId}`;

    const containers = await docker.listContainers({all: true});
    const existingContainer = containers.find(container => container.Names && container.Names.includes('/' + containerName));

    if (!existingContainer) {
      return {status: 'error', message: 'Aucun conteneur avec ce nom n\'existe'};
    }

    try {
      const container = docker.getContainer(existingContainer.Id);
      if (existingContainer.State !== 'exited') {
        await container.kill();
        return {status: 'success', message: 'Container arrêté avec succès'};
      } else {
        return {status: 'error', message: 'Le conteneur n\'est pas en cours d\'exécution'};
      }
    } catch (error) {
      console.error(error);
      return {status: 'error', message: 'Erreur lors de l\'arrêt du conteneur'};
    }
  }

  public async start({request}: HttpContextContract) {
    const discordId = request.input('discordId');
    if (!discordId) {
      return {status: 'error', message: 'ID Discord non fourni'};
    }

    const containerName = `TogetherSelf-${discordId}`;

    const containers = await docker.listContainers({all: true});
    const existingContainer = containers.find(container => container.Names && container.Names.includes('/' + containerName));

    if (!existingContainer) {
      return {status: 'error', message: 'Aucun conteneur avec ce nom n\'existe'};
    }

    try {
      const container = docker.getContainer(existingContainer.Id);
      if (existingContainer.State === 'exited') {
        await container.start();
        return {status: 'success', message: 'Container démarré avec succès'};
      } else {
        return {status: 'error', message: 'Le conteneur est déjà en cours d\'exécution'};
      }
    } catch (error) {
      console.error(error);
      return {status: 'error', message: 'Erreur lors du démarrage du conteneur'};
    }
  }

  public async restart({request}: HttpContextContract) {
    const discordId = request.input('discordId');
    if (!discordId) {
      return {status: 'error', message: 'ID Discord non fourni'};
    }

    const containerName = `TogetherSelf-${discordId}`;

    const containers = await docker.listContainers({all: true});
    const existingContainer = containers.find(container => container.Names && container.Names.includes('/' + containerName));

    if (!existingContainer) {
      return {status: 'error', message: 'Aucun conteneur avec ce nom n\'existe'};
    }

    try {
      const container = docker.getContainer(existingContainer.Id);
      await container.restart();
      return {status: 'success', message: 'Container redémarré avec succès'};
    } catch (error) {
      console.error(error);
      return {status: 'error', message: 'Erreur lors du redémarrage du conteneur'};
    }
  }

  public async status({request}: HttpContextContract) {
    const discordId = request.input('discordId');
    if (!discordId) {
      return {status: 'error', message: 'ID Discord non fourni'};
    }

    const containerName = `TogetherSelf-${discordId}`;

    const containers = await docker.listContainers({all: true});
    const existingContainer = containers.find(container => container.Names && container.Names.includes('/' + containerName));

    if (!existingContainer) {
      return {status: 'error', message: 'Aucun conteneur avec ce nom n\'existe'};
    }

    try {
      const container = docker.getContainer(existingContainer.Id);
      const containerInfo = await container.inspect();
      const stats = await new Promise((resolve, reject) => {
        container.stats((error, stream) => {
          if (error) {
            reject(error);
          } else {
            container.modem.demuxStream(stream, process.stdout, process.stderr);
            stream.on('data', (data) => {
              const stats = JSON.parse(data.toString());
              resolve(stats);
              stream.destroy();
            });
          }
        });
      });

      // @ts-ignore
      const cpuUsage = ((stats.cpu_stats.cpu_usage.total_usage / stats.cpu_stats.system_cpu_usage) * 100).toFixed(2);
      // @ts-ignore
      const memoryUsageMB = (stats.memory_stats.usage / (1024 * 1024)).toFixed(2);
      // @ts-ignore
      const memoryLimitMB = (stats.memory_stats.limit / (1024 * 1024)).toFixed(2);
      // @ts-ignore
      const memoryUsagePercent = ((stats.memory_stats.usage / stats.memory_stats.limit) * 100).toFixed(2);
      // @ts-ignore
      const uptimeMilliseconds = Date.now() - new Date(containerInfo.State.StartedAt).getTime();
      const uptime = this.formatUptime(uptimeMilliseconds);
      const containerStatus = existingContainer.State;

      return {
        status: containerStatus,
        data: {
          uptime: uptime,
          memoryUsageMB: memoryUsageMB,
          memoryLimitMB: memoryLimitMB,
          memoryUsagePercent: memoryUsagePercent,
          cpuUsage: cpuUsage
        }
      };
    } catch (error) {
      console.error(error);
      return {status: 'error', message: 'Erreur lors de la récupération des statistiques du conteneur'};
    }
  }

  private formatUptime(milliseconds: number) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    let days = Math.floor(hours / 24);
    hours = hours % 24;
    let months = Math.floor(days / 30);
    days = days % 30;

    return {
      months: months,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
  }

  public async execute({request}: HttpContextContract) {
    const discordId = request.input('discordId');
    const action = request.input('action');
    if (!discordId || !action) {
      return {status: 'error', message: 'ID Discord ou action non fourni'};
    }

    const containerName = `TogetherSelf-${discordId}`;

    const containers = await docker.listContainers({all: true});
    const existingContainer = containers.find(container => container.Names && container.Names.includes('/' + containerName));

    if (!existingContainer) {
      return {status: 'error', message: 'Aucun conteneur avec ce nom n\'existe'};
    }

    try {
      const Redis = require('ioredis');
      const redis = new Redis({
        host: 'localhost',
        port: 6379
      });
      redis.publish('channel-' + discordId, action);

      return {status: 'success', message: 'Action exécutée avec succès'};
    } catch (error) {
      console.error(error);
      return {status: 'error', message: 'Erreur lors de l\'exécution de l\'action'};
    }
  }

  public async exists({request}: HttpContextContract) {
    const discordId = request.input('discordId');
    if (!discordId) {
      return {status: 'error', message: 'ID Discord non fourni'};
    }

    const containerName = `TogetherSelf-${discordId}`;

    const containers = await docker.listContainers({all: true});
    const existingContainer = containers.find(container => container.Names && container.Names.includes('/' + containerName));

    if (existingContainer) {
      return {status: 'success', message: 'Un conteneur avec ce nom existe déjà'};
    } else {
      return {status: 'error', message: 'Aucun conteneur avec ce nom n\'existe'};
    }
  }

  public async listconnected() {
    const Redis = require('ioredis');
    const redis = new Redis({
      host: 'localhost',
      port: 6379
    });
    try {
      const keys = await redis.pubsub('channels', 'channel-*');
      const connectedIds = keys.map(key => key.split('-')[1]);
      return {status: 'success', message: 'Liste des utilisateurs connectés récupérée', data: connectedIds};
    } finally {
      redis.disconnect();
    }
  }

  public async dockerinfo() {
    const containers = await docker.listContainers({all: true});
    const containersLength = containers.length;

    if (containersLength === 0) {
      return {containersLength, averageRamUsageMB: null, averageCpuUsagePercent: null};
    }

    let totalRamUsageMB = 0;
    let totalCpuUsagePercent = 0;

    for (const containerInfo of containers) {
      if (containerInfo.State !== 'running') {
        continue;
      }

      const container = docker.getContainer(containerInfo.Id);
      const stats = await new Promise((resolve, reject) => {
        container.stats((error, stream) => {
          if (error) {
            reject(error);
          } else {
            container.modem.demuxStream(stream, process.stdout, process.stderr);
            stream.on('data', (data) => {
              const stats = JSON.parse(data.toString());
              if (stats && stats.cpu_stats && stats.memory_stats) {
                resolve(stats);
              } else {
                resolve(null);
              }
              stream.destroy();
            });
          }
        });
      });

      if (stats) {
        // @ts-ignore
        const cpuUsagePercent = ((stats.cpu_stats.cpu_usage.total_usage / stats.cpu_stats.system_cpu_usage) * 100).toFixed(2);
        // @ts-ignore
        const memoryUsageMB = (stats.memory_stats.usage / (1024 * 1024)).toFixed(2);

        totalRamUsageMB += parseFloat(memoryUsageMB);
        totalCpuUsagePercent += parseFloat(cpuUsagePercent);
      }
    }

    const averageRamUsageMB = totalRamUsageMB / containersLength;
    const averageCpuUsagePercent = totalCpuUsagePercent / containersLength;

    return {containersLength, averageRamUsageMB, averageCpuUsagePercent};
  }

  public async restartall() {
    const containers = await docker.listContainers({all: true});

    for (const containerInfo of containers) {
      if (containerInfo.State !== 'running') {
        continue;
      }

      const container = docker.getContainer(containerInfo.Id);
      await container.kill()
      await container.start()
    }

    return {status: 'success', message: 'Tous les conteneurs ont été redémarrés'};
  }

  public async howmanyuser(){
    const containerName = `/TogetherSelf-`;

    const containers = await docker.listContainers({all: true});
    const togethercordInstances = containers.filter(container => container.Names && container.Names.some(name => name.startsWith(containerName)));
    return {status: 'success', message: 'Nombre de Instance récupéré', data: togethercordInstances.length};
  }

}
