export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
        email: string;
        first_name: string;
        last_name: string;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
      };
    }
  }
}
