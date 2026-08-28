import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { INITIAL_FARM_PRODUCTS } from '../data/seedProducts';

const PRODUCTS_COLLECTION = 'products';

// Seed demo farm products if collection is empty
export async function seedProductsIfEmpty(): Promise<boolean> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log('Seeding initial EcoMind Fresh farm catalog...');
      const batchPromises = INITIAL_FARM_PRODUCTS.map(async (item, index) => {
        const docId = `prod_${String(index + 1).padStart(3, '0')}`;
        const docRef = doc(db, PRODUCTS_COLLECTION, docId);
        await setDoc(docRef, {
          ...item,
          id: docId
        });
      });
      await Promise.all(batchPromises);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeding products:', error);
    return false;
  }
}

// Force re-seed / refresh farm catalog
export async function forceSeedProducts(): Promise<void> {
  const batchPromises = INITIAL_FARM_PRODUCTS.map(async (item, index) => {
    const docId = `prod_${String(index + 1).padStart(3, '0')}`;
    const docRef = doc(db, PRODUCTS_COLLECTION, docId);
    await setDoc(docRef, {
      ...item,
      id: docId
    });
  });
  await Promise.all(batchPromises);
}

// Subscribe to real-time products list
export function subscribeToProducts(
  callback: (products: Product[]) => void,
  category?: string
): () => void {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  let q = query(productsRef);
  
  if (category && category !== 'All') {
    q = query(productsRef, where('category', '==', category));
  }

  return onSnapshot(q, (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      products.push({
        id: docSnap.id,
        ...data
      } as Product);
    });
    
    // Sort so available items come first
    products.sort((a, b) => {
      if (a.status === 'sold_out' && b.status !== 'sold_out') return 1;
      if (a.status !== 'sold_out' && b.status === 'sold_out') return -1;
      return 0;
    });

    callback(products);
  }, (error) => {
    console.error('Products listener error:', error);
    // Fallback to initial seeds if offline or permissions issue
    callback(INITIAL_FARM_PRODUCTS.map((p, i) => ({ ...p, id: `prod_${i + 1}` })) as Product[]);
  });
}

// Get single product
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    // Check fallback
    const fallback = INITIAL_FARM_PRODUCTS.find((_, i) => `prod_${i + 1}` === id || `prod_${String(i + 1).padStart(3, '0')}` === id);
    if (fallback) {
      return { id, ...fallback } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Atomic stock deduction during checkout
export async function deductProductStock(
  items: { productId: string; quantity: number }[]
): Promise<boolean> {
  try {
    await runTransaction(db, async (transaction) => {
      // First read all items
      const reads = await Promise.all(
        items.map(item => {
          const ref = doc(db, PRODUCTS_COLLECTION, item.productId);
          return transaction.get(ref);
        })
      );

      // Verify availability
      reads.forEach((snap, idx) => {
        if (!snap.exists()) {
          throw new Error(`Product ${items[idx].productId} not found`);
        }
        const currentQty = snap.data().availableQuantity || 0;
        const requestedQty = items[idx].quantity;
        if (currentQty < requestedQty) {
          throw new Error(`Insufficient stock for ${snap.data().name}. Available: ${currentQty}`);
        }
      });

      // Perform updates
      reads.forEach((snap, idx) => {
        const ref = doc(db, PRODUCTS_COLLECTION, items[idx].productId);
        const currentQty = snap.data().availableQuantity || 0;
        const newQty = Math.max(0, currentQty - items[idx].quantity);
        let newStatus: Product['status'] = 'available';
        if (newQty === 0) {
          newStatus = 'sold_out';
        } else if (newQty < 15) {
          newStatus = 'low_stock';
        }

        transaction.update(ref, {
          availableQuantity: newQty,
          status: newStatus
        });
      });
    });

    return true;
  } catch (error) {
    console.error('Stock deduction transaction failed:', error);
    return false;
  }
}
