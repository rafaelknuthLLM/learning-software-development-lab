const supabase = require('../../config/database');

const Post = {
  async create({ title, content, author_id }) {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, content, author_id }])
      .select();
    return { data, error };
  },

  async getAll() {
    const { data, error } = await supabase.from('posts').select('*');
    return { data, error };
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async findByAuthor(author_id) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', author_id);
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    return { data, error };
  }
};

module.exports = Post;