// src/Modules/Users/UserRepository.ts
import { Service } from 'typedi';
import { FindOneOptions, ObjectID, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UserInput } from './UserInput';
import { User } from './UserModel';

@Service()
export class UserRepository {
  public constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new usr database entity
   * @param timelineInput Input data for new user entitiy
   *
   * @returns Promise resolving to an array of all Database entries
   */
  public createUser(userInput: UserInput): Promise<User> {
    const user = this.userRepository.create(userInput);

    return this.userRepository.save(user);
  }

  /**
   * Save a User entity in database
   * @param user User Entity
   *
   * @returns Promise resolving to the saved database entry
   */
  public saveUsingRepository(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  /**
   * Find all entities in database
   *
   * @returns Promise resolving to all User entities in database
   */
  public findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Finds first entity that matches given options.
   */
  public findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<User>,
  ): Promise<User>;

  public findOne(options?: FindOneOptions<User>): Promise<User>;

  public findOne(options?: unknown, params?: unknown): Promise<User> {
    return this.userRepository.findOneOrFail(options, params);
  }

  /**
   * Find and delete a user entity
   *
   * @argument userId User UUID to delete
   *
   * @returns Promise resolving to an array of all remaining Users
   */
  public async findAndDeleteUser(userId: string): Promise<User[]> {
    const user = await this.userRepository.findOneOrFail(userId);
    await this.userRepository.remove(user);

    return this.findAll();
  }
}
