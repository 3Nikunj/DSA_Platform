import { Request, Response } from 'express';
import { supabaseService, supabaseAnon } from '../config/supabase';
import { AuthenticatedRequest } from '../middleware/auth-supabase';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password, firstName, lastName } = req.body;
  try {
    const { data: authData, error: authError } =
      await supabaseService.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { username, first_name: firstName, last_name: lastName },
      });

    if (authError) {
      res.status(400).json({ success: false, message: authError.message });
      return;
    }

    if (!authData.user) {
      res
        .status(500)
        .json({ success: false, message: 'Failed to create user' });
      return;
    }

    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          username,
          first_name: firstName,
          last_name: lastName,
          is_verified: false,
          is_premium: false,
          level: 1,
          xp: 0,
          coins: 0,
          password: 'supa-auth-managed',
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (userError) {
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      res
        .status(500)
        .json({
          success: false,
          message: 'Failed to create user profile: ' + userError.message,
        });
      return;
    }

    res.status(201).json({
      success: true,
      message:
        'User registered successfully. Please verify your email to sign in.',
      user: userData,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      res.status(401).json({ success: false, message: error.message });
      return;
    }

    const { data: profile } = await supabaseService
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: profile || data.user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logout successful' });
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const { data: profile } = await supabaseService
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();
  res.json({ success: true, user: profile || req.user });
};
