'use client';

import { useEffect } from 'react';
import { getClientStore } from '@/lib/client-store';
import { toast } from 'sonner';

export function useRideExpiry() {
  useEffect(() => {
    function checkExpiry() {
      const store = getClientStore();
      const now = Date.now();
      store.rides.forEach((ride) => {
        if (ride.status === 'active' && ride.expiresAt) {
          const expTime = new Date(ride.expiresAt).getTime();
          const remaining = expTime - now;
          // Warn 5 minutes before expiry
          if (remaining > 0 && remaining < 5 * 60 * 1000) {
            const mins = Math.ceil(remaining / 60000);
            toast.warning(`⏱ Votre trajet ${ride.scooterCode} expire dans ${mins} min !`);
          }
          // Auto-end expired ride
          if (remaining <= 0) {
            store.endRide(ride.id);
            toast.info(`Trajet ${ride.scooterCode} terminé automatiquement (temps écoulé).`);
          }
        }
      });
    }

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);
}
