
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

interface BettingSite {
  id: string;
  name: string;
  display_name: string;
  url: string;
  logo_url: string | null;
  button_color: string;
  is_active: boolean;
  created_at: string;
}

const BettingSites = () => {
  const [sites, setSites] = useState<BettingSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState<BettingSite | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    url: '',
    logo_url: '',
    button_color: 'green'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast({ title: "Error fetching sites", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSite) {
        const { error } = await supabase
          .from('betting_sites')
          .update(formData)
          .eq('id', editingSite.id);
        
        if (error) throw error;
        toast({ title: "Site updated successfully" });
      } else {
        const { error } = await supabase
          .from('betting_sites')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Site added successfully" });
      }
      
      setFormData({ name: '', display_name: '', url: '', logo_url: '', button_color: 'green' });
      setShowForm(false);
      setEditingSite(null);
      fetchSites();
    } catch (error) {
      console.error('Error saving site:', error);
      toast({ title: "Error saving site", variant: "destructive" });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('betting_sites')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
      
      setSites(prev => 
        prev.map(site => site.id === id ? { ...site, is_active } : site)
      );
      
      toast({ title: `Site ${is_active ? 'activated' : 'deactivated'}` });
    } catch (error) {
      console.error('Error updating site:', error);
      toast({ title: "Error updating site", variant: "destructive" });
    }
  };

  const deleteSite = async (id: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    
    try {
      const { error } = await supabase
        .from('betting_sites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSites(prev => prev.filter(site => site.id !== id));
      toast({ title: "Site deleted successfully" });
    } catch (error) {
      console.error('Error deleting site:', error);
      toast({ title: "Error deleting site", variant: "destructive" });
    }
  };

  const startEdit = (site: BettingSite) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      display_name: site.display_name,
      url: site.url,
      logo_url: site.logo_url || '',
      button_color: site.button_color
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingSite(null);
    setFormData({ name: '', display_name: '', url: '', logo_url: '', button_color: 'green' });
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
        <CardContent className="p-8 text-center">
          <div className="text-orange-500">Loading betting sites...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-orange-500">Betting Sites ({sites.length})</h2>
        <div className="flex gap-2">
          <Button onClick={fetchSites} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Site
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-orange-500">
              {editingSite ? 'Edit Site' : 'Add New Site'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., cricindia99"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="e.g., cricindia99.com (CricBet99)"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Logo URL (optional)</label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button Color</label>
                  <select
                    value={formData.button_color}
                    onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
                    className="w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingSite ? 'Update' : 'Add'} Site
                </Button>
                <Button type="button" onClick={cancelForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sites List */}
      {sites.length === 0 ? (
        <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
          <CardContent className="p-8 text-center text-gray-400">
            No betting sites found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <Card key={site.id} className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{site.display_name}</h3>
                    <p className="text-gray-400 text-sm">{site.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <a 
                        href={site.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline text-sm flex items-center"
                      >
                        {site.url} <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${site.button_color === 'green' ? 'bg-green-500' : 
                      site.button_color === 'red' ? 'bg-red-500' : 
                      site.button_color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                      {site.button_color}
                    </Badge>
                    {site.is_active ? (
                      <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-500">Inactive</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={site.is_active}
                      onCheckedChange={(checked) => toggleActive(site.id, checked)}
                    />
                    <span className="text-sm text-gray-400">Active</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(site)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSite(site.id)}
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

export default BettingSites;
