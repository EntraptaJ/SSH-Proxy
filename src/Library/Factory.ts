// src/Library/Factory.ts
import { EntityTarget, getConnection } from 'typeorm';

export async function saveOne<E, T extends EntityTarget<E>>(
  current: T,
): Promise<T> {
  try {
    const repository = getConnection().getRepository(current.constructor.name);
    return repository.save(current);
  } catch (e) {
    console.log(e);
  }
}
