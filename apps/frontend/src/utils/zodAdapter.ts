import { z } from 'zod';
import type { Rule } from 'antd/es/form';

export const zodRule = (schema: z.ZodTypeAny): Rule => ({
  validator: async (_, value) => {
    const result = await schema.safeParseAsync(value);
    
    if (!result.success) {
      return Promise.reject(new Error(result.error.issues[0].message));
    }
    
    return Promise.resolve();
  },
});