import { Db } from 'mongodb';
import { DatabaseSpec } from '../types/types';
import { getLogger } from '../utils/get-logger';

const logger = getLogger(__filename);

export async function versionDatabase(db: Db, infoCollection: string, databaseSpec: DatabaseSpec): Promise<Db> {
  try {
    logger.debug('Versioning Database: %s', `${db.databaseName}@${databaseSpec.version}`);
    logger.cli('--- Versioning Database: %s', `${db.databaseName}@${databaseSpec.version}`);
    const newMeta = { version: databaseSpec.version };
    const collection = db.collection(infoCollection);
    const currentMeta = await collection.findOne({});
    if (!currentMeta) {
      await collection.insertOne(newMeta);
    }
    if (currentMeta && currentMeta.version !== newMeta.version) {
      await collection.deleteOne({ _id: currentMeta._id });
      await collection.insertOne(newMeta);
    }
    logger.info('Versioned Database: %s', `${db.databaseName}@${databaseSpec.version}`);
    return db;
  } catch (error) {
    logger.error('Error versioning Database: %s', `${db.databaseName}@${databaseSpec.version}`);
    logger.cli('--- Error versioning Database: %s', `${db.databaseName}@${databaseSpec.version}`);
    throw error;
  }
}
