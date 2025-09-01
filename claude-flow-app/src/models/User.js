const supabase = require('../../config/database');

const User = {
  async create({ email, password, username }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    });
    return { data, error };
  },

  async findByEmail(email) {
    // This is not a direct Supabase function, so we will handle this in the controller.
    // We can query the users table, but that's not the standard way to check for an existing user.
    // The standard way is to try to sign up and see if it fails.
    return null;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }
};

module.exports = User;