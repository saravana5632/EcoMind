import {
  Firestore,
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  writeBatch,
  WhereFilterOp,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { logger } from '../utils/logger';

export class FirebaseService {
  private static get db(): Firestore {
    return getDb();
  }

  /**
   * Fetch a single document by ID from a collection
   */
  static async getDocument<T = DocumentData>(
    collectionName: string,
    docId: string
  ): Promise<(T & { id: string }) | null> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
    } catch (error) {
      logger.error(`[FirebaseService] Error getDocument ${collectionName}/${docId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all documents from a collection with optional filtering and sorting
   */
  static async getCollection<T = DocumentData>(
    collectionName: string,
    options?: {
      limit?: number;
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<(T & { id: string })[]> {
    try {
      const colRef = collection(this.db, collectionName);
      let q: any = colRef;

      const constraints: any[] = [];
      if (options?.orderByField) {
        constraints.push(orderBy(options.orderByField, options.orderDirection || 'desc'));
      }
      if (options?.limit) {
        constraints.push(limit(options.limit));
      }

      if (constraints.length > 0) {
        q = query(colRef, ...constraints);
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as any as T & { id: string }));
    } catch (error) {
      logger.error(`[FirebaseService] Error getCollection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document with an auto-generated ID or specific ID
   */
  static async createDocument<T = DocumentData>(
    collectionName: string,
    data: any,
    customId?: string
  ): Promise<T & { id: string }> {
    try {
      const now = new Date().toISOString();
      const payload = {
        ...data,
        createdAt: data.createdAt || now,
        updatedAt: now,
      };

      if (customId) {
        const docRef = doc(this.db, collectionName, customId);
        await setDoc(docRef, payload, { merge: true });
        return { id: customId, ...payload } as any as T & { id: string };
      } else {
        const colRef = collection(this.db, collectionName);
        const docRef = await addDoc(colRef, payload);
        return { id: docRef.id, ...payload } as any as T & { id: string };
      }
    } catch (error) {
      logger.error(`[FirebaseService] Error createDocument in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  static async updateDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    data: any
  ): Promise<(T & { id: string }) | null> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, payload);
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() } as T & { id: string };
    } catch (error) {
      logger.error(`[FirebaseService] Error updateDocument in ${collectionName}/${docId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(collectionName: string, docId: string): Promise<boolean> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      logger.error(`[FirebaseService] Error deleteDocument ${collectionName}/${docId}:`, error);
      throw error;
    }
  }

  /**
   * Query a collection with field equality or array-contains filters
   */
  static async queryCollection<T = DocumentData>(
    collectionName: string,
    filters: Array<{ field: string; operator: WhereFilterOp; value: any }>,
    options?: {
      limit?: number;
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<(T & { id: string })[]> {
    try {
      const colRef = collection(this.db, collectionName);
      const constraints: any[] = [];

      for (const f of filters) {
        if (f.value !== undefined && f.value !== null) {
          constraints.push(where(f.field, f.operator, f.value));
        }
      }

      if (options?.orderByField) {
        constraints.push(orderBy(options.orderByField, options.orderDirection || 'desc'));
      }

      if (options?.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as any as T & { id: string }));
    } catch (error) {
      logger.error(`[FirebaseService] Error queryCollection in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Execute an atomic transaction
   */
  static async runTransaction<T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    return runTransaction(this.db, updateFunction);
  }

  /**
   * Create a batch write
   */
  static batch() {
    return writeBatch(this.db);
  }
}
