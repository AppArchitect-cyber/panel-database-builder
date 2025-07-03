
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, MessageCircle, CheckCircle, Clock, Phone } from 'lucide-react';

interface UserSubmission {
  id: string;
  name: string;
  mobile_number: string;
  selected_website: string;
  submitted_at: string;
  status: 'pending' | 'processed' | 'contacted';
}

const UserSubmissions = () => {
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({ title: "Error fetching submissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'processed' | 'contacted') => {
    try {
      const { error } = await supabase
        .from('user_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, status } : sub)
      );
      
      toast({ title: `Status updated to ${status}` });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  const openWhatsApp = (mobile: string, name: string, website: string) => {
    const message = `Hello ${name}, regarding your request for ${website} ID. We will process your request shortly.`;
    const whatsappURL = `https://wa.me/${mobile.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processed':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Processed</Badge>;
      case 'contacted':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-500"><Phone className="w-3 h-3 mr-1" />Contacted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
        <CardContent className="p-8 text-center">
          <div className="text-orange-500">Loading submissions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-orange-500">User Submissions ({submissions.length})</h2>
        <Button onClick={fetchSubmissions} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
          <CardContent className="p-8 text-center text-gray-400">
            No submissions found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="bg-gradient-to-b from-gray-800 to-black border-orange-500/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white">{submission.name}</CardTitle>
                    <p className="text-gray-400 text-sm">
                      {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="text-gray-400">Mobile:</span> 
                    <span className="text-white ml-2">{submission.mobile_number}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">Website:</span> 
                    <span className="text-white ml-2">{submission.selected_website}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWhatsApp(submission.mobile_number, submission.name, submission.selected_website)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  
                  {submission.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(submission.id, 'processed')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Mark Processed
                    </Button>
                  )}
                  
                  {submission.status !== 'contacted' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(submission.id, 'contacted')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Mark Contacted
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSubmissions;
