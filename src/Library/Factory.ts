// src/Library/Factory.ts
import { getConnection } from 'typeorm';

export async function saveOne(current: any) {
  try {
    const repository = getConnection().getRepository(current.constructor.name);
    return await repository.save(current);
  } catch (e) {
    console.log(e);
  }
}
