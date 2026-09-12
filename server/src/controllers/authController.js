import { supabase, supabaseAnon, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { mockUsers } from '../middleware/auth.js';

/**
 * Register a new user account
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId, role = 'student' } = req.body;

    if (isConfigured && supabase) {
      // 1. Create auto-confirmed user via Supabase Admin Auth
      let user;
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          studentId,
          role,
        },
      });

      if (adminError) {
        // Fallback to standard signUp if admin API has any issue
        const { data: authData, error: authError } = await (supabaseAnon || supabase).auth.signUp({
          email,
          password,
          options: {
            data: { name, studentId, role },
          },
        });
        if (authError) {
          return errorResponse(res, authError.message, 'REGISTRATION_FAILED', 400);
        }
        user = authData.user;
      } else {
        user = adminData.user;
      }

      if (!user) {
        return errorResponse(res, 'Could not create user account', 'REGISTRATION_FAILED', 400);
      }

      // 2. Create or upsert profile in public.profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          student_id: studentId,
          email,
          role,
        })
        .select()
        .single();

      if (profileError) {
        console.warn('[authController] Profile creation warning:', profileError.message);
      }

      // 3. Obtain a valid session token
      let token = `jwt_${user.id}`;
      if (supabaseAnon) {
        const { data: sessionData } = await supabaseAnon.auth.signInWithPassword({
          email,
          password,
        });
        if (sessionData?.session?.access_token) {
          token = sessionData.session.access_token;
        }
      }

      return successResponse(
        res,
        {
          token,
          user: {
            id: user.id,
            name: profile?.name || name,
            studentId: profile?.student_id || studentId,
            email: profile?.email || email,
            role: profile?.role || role,
          },
        },
        201
      );
    }

    // Fallback registration for local/offline mode
    const id = `u_${Date.now()}`;
    const newUser = {
      id,
      name,
      student_id: studentId,
      email,
      role,
    };
    mockUsers.set(id, newUser);

    return successResponse(
      res,
      {
        token: id,
        user: {
          id: newUser.id,
          name: newUser.name,
          studentId: newUser.student_id,
          email: newUser.email,
          role: newUser.role,
        },
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Sign in user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (isConfigured && (supabaseAnon || supabase)) {
      const client = supabaseAnon || supabase;
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return errorResponse(res, error.message || 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
      }

      const user = data.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return successResponse(res, {
        token: data.session.access_token,
        user: {
          id: user.id,
          name: profile?.name || user.user_metadata?.name || 'Student',
          studentId: profile?.student_id || user.user_metadata?.studentId || 'STU00000',
          email: profile?.email || user.email,
          role: profile?.role || user.user_metadata?.role || 'student',
        },
      });
    }

    // Fallback login
    const foundUser = Array.from(mockUsers.values()).find((u) => u.email === email);
    if (!foundUser) {
      // In local prototype mode, auto-provision user if logging in
      const newId = `u_${Date.now()}`;
      const fallbackUser = {
        id: newId,
        name: email.split('@')[0],
        student_id: 'STU12345',
        email,
        role: email.includes('admin') ? 'admin' : 'student',
      };
      mockUsers.set(newId, fallbackUser);
      return successResponse(res, {
        token: newId,
        user: {
          id: fallbackUser.id,
          name: fallbackUser.name,
          studentId: fallbackUser.student_id,
          email: fallbackUser.email,
          role: fallbackUser.role,
        },
      });
    }

    return successResponse(res, {
      token: foundUser.id,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        studentId: foundUser.student_id,
        email: foundUser.email,
        role: foundUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Sign out user
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    return successResponse(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user details
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }
    return successResponse(res, req.user);
  } catch (err) {
    next(err);
  }
};

/**
 * Request password reset
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (isConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return errorResponse(res, error.message, 'RESET_FAILED', 400);
      }
    }

    return successResponse(res, {
      message: 'Password reset instructions have been sent to your email address.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, studentId } = req.body;

    if (isConfigured && supabase) {
      const updates = {};
      if (name) updates.name = name;
      if (studentId) updates.student_id = studentId;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'UPDATE_FAILED', 400);
      }

      return successResponse(res, {
        id: data.id,
        name: data.name,
        studentId: data.student_id,
        email: data.email,
        role: data.role,
      });
    }

    // Fallback update
    const user = mockUsers.get(userId);
    if (user) {
      if (name) user.name = name;
      if (studentId) user.student_id = studentId;
    }

    return successResponse(res, {
      id: userId,
      name: user?.name || name,
      studentId: user?.student_id || studentId,
      email: user?.email || req.user.email,
      role: user?.role || req.user.role,
    });
  } catch (err) {
    next(err);
  }
};
