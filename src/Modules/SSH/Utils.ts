// src/Modules/SSH/Utils.ts

import { Client, ClientChannel, ExecOptions } from 'ssh2';

export const execCommand = (
  command: string,
  sshClient: Client,
  options: ExecOptions = {}
) =>
  new Promise<ClientChannel>((resolve, reject) => {
    console.log('Execing with: ', options);

    sshClient.exec(command, options, (err, stream) => {
      if (err) {
        reject(err);
      }

      resolve(stream);
    });
  });
