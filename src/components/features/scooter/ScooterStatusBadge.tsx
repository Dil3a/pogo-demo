/**
 * Maps a scooter's machine-readable status to a French-labelled coloured pill.
 * Centralised here so the mapping is consistent across cards, lists, and admin.
 */

import { Badge } from '@/components/ui';
import type { ScooterStatus } from '@/types/domain';

const labels: Record<ScooterStatus, string> = {
  available: 'Disponible',
  occupied: 'En cours',
  charging: 'En charge',
  maintenance: 'Maintenance',
  offline: 'Hors-ligne',
};

const variants: Record<
  ScooterStatus,
  'green' | 'red' | 'orange' | 'slate' | 'purple'
> = {
  available: 'green',
  occupied: 'red',
  charging: 'orange',
  maintenance: 'purple',
  offline: 'slate',
};

export function ScooterStatusBadge({ status }: { status: ScooterStatus }) {
  return <Badge variant={variants[status]}>● {labels[status]}</Badge>;
}
