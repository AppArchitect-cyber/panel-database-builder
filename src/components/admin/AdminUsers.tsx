
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Trash2, UserPlus } from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const AdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({ title: "Error fetching admin users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Then add them to admin_users table
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert([{
            user_id: authData.user.id,
            role: formData.role
          }]);

        if (adminError) throw adminError;

        toast({ title: "Admin user created successfully" });
        setFormData({ email: '', password: '', role: 'admin' });
        setShowForm(false);
        fetchAdminUsers();
      }
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast({ 
        title: "Error creating admin user", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const deleteAdminUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this admin user?')) return;
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAdminUsers(prev => prev.filter(user => user.id !== id));
      toast({ title: "Admin user removed successfully" });
    } catch (error) {
      console.error('Error deleting admin user:', error);
      toast({ title: "Error deleting admin user", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
        <CardContent className="p-8 text-center">
          <div className="text-orange-500">Loading admin users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-orange-500">Admin Users ({adminUsers.length})</h2>
        <div className="flex gap-2">
          <Button onClick={fetchAdminUsers} size="sm" variant="outline" className="bg-orange-600 hover:bg-orange-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-orange-500 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Add New Admin User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  Create Admin User
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Admin Users List */}
      {adminUsers.length === 0 ? (
        <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
          <CardContent className="p-8 text-center text-gray-400">
            No admin users found. Add one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {adminUsers.map((adminUser) => (
            <Card key={adminUser.id} className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Admin User</h3>
                    <p className="text-gray-400 text-sm">ID: {adminUser.user_id}</p>
                    <p className="text-gray-400 text-sm">
                      Created: {new Date(adminUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={adminUser.role === 'admin' ? 'bg-orange-500' : 'bg-blue-500'}>
                      {adminUser.role}
                    </Badge>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteAdminUser(adminUser.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
