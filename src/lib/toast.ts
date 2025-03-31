import { toast as t } from 'sonner';

export const toast = {
  success(message: string) {
    t.success(message);
  },
  error(message: string) {
    t.error(message);
  },
};
