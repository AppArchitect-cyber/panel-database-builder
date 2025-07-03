import WhatsAppSettings from "@/components/admin/WhatsAppSettings";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { LogOut, Users, Database, Settings, Eye } from 'lucide-react';
import UserSubmissions from '@/components/admin/UserSubmissions';
import BettingSites from '@/components/admin/BettingSites';
import AdminUsers from '@/components/admin/AdminUsers';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('submissions');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate('/admin/auth');
        } else {
          // Check if user is admin
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/admin/auth');
      } else {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
        if (!data) {
          toast({ 
            title: "Access Denied", 
            description: "You don't have admin privileges.",
            variant: "destructive" 
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Access Denied</h2>
            <p className="text-gray-400 mb-4">You don't have admin privileges.</p>
            <Button onClick={() => navigate('/admin/auth')} variant="outline">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-black border-b border-orange-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-orange-500">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome, {user?.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            User Submissions
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sites'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Database className="w-4 h-4 mr-2" />
            Betting Sites
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'admins'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Users
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'whatsapp'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            WhatsApp Number
          </button>

        </div>

        {/* Tab Content */}
        {activeTab === 'submissions' && <UserSubmissions />}
        {activeTab === 'sites' && <BettingSites />}
        {activeTab === 'admins' && <AdminUsers />}
        {activeTab === 'whatsapp' && <WhatsAppSettings />}
      </div>
    </div>
  );
};

export default AdminDashboard;
