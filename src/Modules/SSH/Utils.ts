// src/Modules/SSH/Utils.ts

import { Client, ClientChannel, ExecOptions, SFTPWrapper } from 'ssh2';

export const execCommand = (
  command: string,
  sshClient: Client,
  options: ExecOptions = {},
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

export const sftpMe = (sshClient: Client) =>
  new Promise<SFTPWrapper>((resolve, reject) => {
    sshClient.sftp((err, sftp) => {
      if (err) {
        reject(err);
      }

      resolve(sftp);
    });
  });
