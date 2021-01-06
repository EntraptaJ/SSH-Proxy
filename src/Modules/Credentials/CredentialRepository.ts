// src/Modules/Credentials/CredentialRepository.ts
import { Service } from 'typedi';
import { FindOneOptions, ObjectID, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CredentialInput } from './CredentialInput';
import { Credential } from './CredentialModel';

@Service()
export class CredentialRepository {
  public constructor(
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
  ) {}

  /**
   * Create a new credential database entity
   * @param timelineInput Input data for new credential entitiy
   *
   * @returns Promise resolving to an array of all Database entries
   */
  public createCredential(input: CredentialInput): Promise<Credential> {
    const credential = this.credentialRepository.create(input);

    return this.credentialRepository.save(credential);
  }

  /**
   * Save a User entity in database
   * @param user User Entity
   *
   * @returns Promise resolving to the saved database entry
   */
  public saveUsingRepository(credential: Credential): Promise<Credential> {
    return this.credentialRepository.save(credential);
  }

  /**
   * Find all entities in database
   *
   * @returns Promise resolving to all User entities in database
   */
  public findAll(): Promise<Credential[]> {
    return this.credentialRepository.find();
  }

  /**
   * Finds first entity that matches given options.
   */
  public findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Credential>,
  ): Promise<Credential>;

  public findOne(options?: FindOneOptions<Credential>): Promise<Credential>;

  public findOne(options?: unknown, params?: unknown): Promise<Credential> {
    return this.credentialRepository.findOneOrFail(options, params);
  }

  /**
   * Find and delete a user entity
   *
   * @argument id Credential UUID to delete
   *
   * @returns Promise resolving to an array of all remaining entities
   */
  public async findAndDeleteUser(id: string): Promise<Credential[]> {
    const credential = await this.credentialRepository.findOneOrFail(id);
    await this.credentialRepository.remove(credential);

    return this.findAll();
  }
}
