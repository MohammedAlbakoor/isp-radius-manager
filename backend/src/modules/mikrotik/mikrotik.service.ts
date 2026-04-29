import { Injectable, Logger } from '@nestjs/common';
import { RouterOSAPI } from 'node-routeros';

export interface RouterInfo {
  identity: string;
  version: string;
  uptime: string;
  model?: string;
  cpu?: string;
  memory?: string;
}

@Injectable()
export class MikrotikService {
  private readonly logger = new Logger(MikrotikService.name);

  async testConnection(
    host: string,
    port: number,
    username: string,
    password: string,
  ): Promise<RouterInfo> {
    const api = new RouterOSAPI({
      host,
      port,
      user: username,
      password,
      timeout: 10,
    });

    try {
      await api.connect();

      const [identity] = await api.write('/system/identity/print');
      const [resource] = await api.write('/system/resource/print');

      await api.close();

      return {
        identity: identity.name || 'Unknown',
        version: resource.version || 'Unknown',
        uptime: resource.uptime || 'Unknown',
        model: resource['board-name'],
        cpu: resource['cpu'],
        memory: resource['total-memory'],
      };
    } catch (error) {
      this.logger.error(`Connection failed to ${host}:${port}`, error);
      throw error;
    }
  }

  async disconnectUser(
    host: string,
    port: number,
    username: string,
    password: string,
    targetUsername: string,
    serviceType: 'pppoe' | 'hotspot',
  ): Promise<boolean> {
    const api = new RouterOSAPI({
      host,
      port,
      user: username,
      password,
      timeout: 10,
    });

    try {
      await api.connect();

      if (serviceType === 'pppoe') {
        const sessions = await api.write('/ppp/active/print', [
          `=.proplist=.id,name`,
          `?name=${targetUsername}`,
        ]);

        for (const session of sessions) {
          await api.write('/ppp/active/remove', [`=.id=${session['.id']}`]);
        }
      } else {
        const sessions = await api.write('/ip/hotspot/active/print', [
          `=.proplist=.id,user`,
          `?user=${targetUsername}`,
        ]);

        for (const session of sessions) {
          await api.write('/ip/hotspot/active/remove', [`=.id=${session['.id']}`]);
        }
      }

      await api.close();
      return true;
    } catch (error) {
      this.logger.error(`Disconnect failed for ${targetUsername} on ${host}`, error);
      throw error;
    }
  }

  async getActiveSessions(
    host: string,
    port: number,
    username: string,
    password: string,
    serviceType: 'pppoe' | 'hotspot',
  ) {
    const api = new RouterOSAPI({
      host,
      port,
      user: username,
      password,
      timeout: 10,
    });

    try {
      await api.connect();

      let sessions;
      if (serviceType === 'pppoe') {
        sessions = await api.write('/ppp/active/print');
      } else {
        sessions = await api.write('/ip/hotspot/active/print');
      }

      await api.close();
      return sessions;
    } catch (error) {
      this.logger.error(`Failed to get active sessions from ${host}`, error);
      throw error;
    }
  }
}
