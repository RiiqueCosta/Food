import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, addDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Restaurant } from '../types';

interface RestaurantContextType {
  restaurant: Restaurant | null;
  loading: boolean;
  createRestaurant: (data: Partial<Restaurant>) => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setRestaurant(null);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'restaurants'),
        where('ownerId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setRestaurant({ id: doc.id, ...doc.data() } as Restaurant);
        } else {
          setRestaurant(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    });

    return () => unsubAuth();
  }, []);

  const createRestaurant = async (data: Partial<Restaurant>) => {
    if (!auth.currentUser) return;
    
    await addDoc(collection(db, 'restaurants'), {
      ...data,
      ownerId: auth.currentUser.uid,
      active: true,
      plan: 'free',
      config: {
        allowPickup: true,
        allowTable: true,
        automaticPrinting: false
      }
    });
  };

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, createRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
