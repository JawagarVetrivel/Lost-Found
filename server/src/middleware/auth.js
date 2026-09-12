import { supabase, isConfigured } from '../config/supabase.js';
import { errorResponse } from '../utils/response.js';

// In-memory fallback mock user store for offline/local development mode
export const mockUsers = new Map([
  [
    'u1',
    {
      id: 'u1',
      name: 'Jane Doe',
      student_id: 'STU10293',
      email: 'jane.doe@university.edu',
      role: 'student',
    },
  ],
  [
    'u-admin',
    {
      id: 'u-admin',
      name: 'Campus Admin',
      student_id: 'ADM00001',
      email: 'admin@university.edu',
      role: 'admin',
    },
  ],
]);

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token required', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.split(' ')[1];

    // If Supabase client is configured, verify with Supabase Auth
    if (isConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return errorResponse(res, 'Invalid or expired authentication token', 'UNAUTHORIZED', 401);
      }

      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Construct fallback user from auth metadata if profile row isn't synced yet
        req.user = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'Student',
          studentId: user.user_metadata?.studentId || user.user_metadata?.student_id || 'STU00000',
          role: user.user_metadata?.role || 'student',
        };
      } else {
        req.user = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          studentId: profile.student_id,
          role: profile.role,
        };
      }

      return next();
    }

    // Fallback mode for local development/testing without live Supabase credentials
    if (token === 'admin-token' || token.includes('admin')) {
      req.user = mockUsers.get('u-admin');
      return next();
    }

    // Look up by token or default to mock student
    const existing = Array.from(mockUsers.values()).find((u) => u.id === token || u.email === token);
    if (existing) {
      req.user = existing;
    } else {
      req.user = mockUsers.get('u1');
    }

    return next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err);
    return errorResponse(res, 'Authentication failed', 'AUTH_ERROR', 401);
  }
};

/**
 * Middleware to restrict route to specific role (e.g. 'admin')
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }
    if (req.user.role !== role) {
      return errorResponse(res, `Forbidden: Requires ${role} role`, 'FORBIDDEN', 403);
    }
    next();
  };
};

/**
 * Middleware to ensure ownership or admin role
 */
export const requireOwnershipOrAdmin = (getOwnerIdFn) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
      }

      if (req.user.role === 'admin') {
        return next();
      }

      const ownerId = await getOwnerIdFn(req);
      if (!ownerId) {
        return errorResponse(res, 'Target resource not found', 'NOT_FOUND', 404);
      }

      if (req.user.id !== ownerId) {
        return errorResponse(res, 'Forbidden: You do not have permission to modify this resource', 'FORBIDDEN', 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
