// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({ message: 'Authentication required' });
      }

      // Validate token by calling auth service
      const response = await axios.get('http://localhost:3804/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { id, role } = response.data;

      // Check if user's role is allowed
      if (!allowedRoles.includes(role)) {
          res.status(403).json({
          message: 'Access denied. Insufficient permissions.'
        });
      }

      req.user = { id, role };
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

// Specific middleware for different roles
export const authenticateAdmin = authenticate(['admin']);
export const authenticateFarmer = authenticate(['farmer']);
export const authenticateConsumer = authenticate(['consumer']);
export const authenticateDeliveryAgent = authenticate(['delivery_agent']);

// Middleware that allows multiple roles
export const authenticateMultipleRoles = (roles: string[]) => authenticate(roles);
