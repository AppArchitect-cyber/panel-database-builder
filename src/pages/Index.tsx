import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { Instagram, Send } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [waNumber, setWaNumber] = useState("");

  const bettingSites = [
    { name: 'cricindia99.com (CricBet99)', url: 'https://cricindia99.com', color: 'bg-green-500', logo: '/cricbet99.jpg' },
    { name: '7xmatch.com (11xplay)', url: 'https://7xmatch.com', color: 'bg-red-500', logo: '/11xplay.jpeg' },
    { name: 'lagan247.com (LaserBook)', url: 'https://lagan247.com', color: 'bg-purple-500', logo: '/laserbook.jpeg' },
    { name: 'lagan365.com (Lotus365)', url: 'https://lagan365.com', color: 'bg-green-500', logo: '/lotus365.png' },
    { name: 'reddybook247.com (ReddyBook)', url: 'https://reddybook247.com', color: 'bg-green-500', logo: 'reddybook.png' },
    { name: 'myfair247.com (Fairplay)', url: 'https://myfair247.com', color: 'bg-red-500', logo: 'fairplay.png' }
  ];

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "whatsapp")
        .maybeSingle();

      if (error) {
        console.error("Error fetching WhatsApp number:", error.message);
      } else {
        setWaNumber(data?.value || "");
      }
    };

    fetchWhatsAppNumber();
  }, []);

  const validateMobile = (mobile: string) => /^[6-9]\d{9}$/.test(mobile);

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && !validateMobile(formData.mobile)) {
      toast({ title: "Please enter a valid 10-digit mobile number starting with 6-9", variant: "destructive" });
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => setCurrentStep(currentStep - 1);

  const handleSiteSelection = async (siteName: string, siteUrl: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_submissions')
        .insert({
          name: formData.name.trim(),
          mobile_number: formData.mobile,
          selected_website: siteName,
          status: 'pending' 
        });

      if (error) throw error;

      const message = `NAME: ${formData.name.trim()}\nMOBILE NUMBER: +91 ${formData.mobile}\nWEBSITE: ${siteName}`;
      const whatsappURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

      window.open(whatsappURL, '_blank');

      toast({ title: "Form submitted successfully! WhatsApp opened." });
      setFormData({ name: '', mobile: '' });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({ title: "Error submitting form", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <img src="/bannerblack.jpg" alt="Reddy Book Banner" className="rounded-lg w-full object-contain mb-4" />
          <h2 className="text-orange-500 text-xl font-semibold mb-2">Welcome to Reddy Book</h2>
          <p className="text-gray-400 text-sm">HELLO SIR KINDLY FILL THE DETAILS FOR NEW ID</p>
        </div>

        {/* Step 1 */}
        {currentStep === 1 && (
          <Card className="bg-[#1c1c1c] text-white rounded-xl p-5 shadow-md">
            <CardHeader><CardTitle className="text-orange-500 text-sm">1/3</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm font-semibold mb-2 block">NAME</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <Button onClick={handleNext} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <ArrowRight className="w-4 h-4 ml-2" /> Next
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <Card className="bg-[#1c1c1c] text-white rounded-xl p-5 shadow-md">
            <CardHeader><CardTitle className="text-orange-500 text-sm">2/3</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">MOBILE NUMBER</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Enter your mobile number"
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Button onClick={handleBack} variant="secondary" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <ArrowRight className="w-4 h-4 ml-2" /> Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <Card className="bg-[#1c1c1c] text-white rounded-xl p-5 shadow-md">
            <CardHeader>
              <CardTitle className="text-orange-500 text-sm">3/3</CardTitle>
              <p className="text-sm">Select Website</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {bettingSites.map((site, index) => (
                  <div key={index} className="bg-[#111] rounded-xl p-4 text-center flex flex-col items-center shadow-md hover:shadow-orange-500 transition duration-300">
                    <img src={site.logo} alt={site.name} className="w-12 h-12 object-contain mb-2" />
                    <h3 className="text-xs font-semibold text-gray-100 mb-3 leading-tight">{site.name}</h3>
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={() => window.open(site.url, "_blank")}
                        className="text-xs bg-white text-black rounded-full px-3 py-1 hover:bg-gray-100 transition"
                      >
                        Visit Site
                      </button>
                      <button
                        onClick={() => handleSiteSelection(site.name, site.url)}
                        className={text-xs text-white rounded-full px-3 py-1 ${site.color} hover:opacity-90 transition}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Get ID"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleBack} variant="secondary" className="w-full mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mt-8 text-orange-500">
          <a
            href="https://t.me/Reddyidsupport"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:text-orange-400 transition"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm">@Reddyidsupport</span>
          </a>
          <a
            href="https://www.instagram.com/reddyid247/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:text-orange-400 transition"
          >
            <Instagram className="w-4 h-4" />
            <span className="text-sm">@reddyid247</span>
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center mt-6 text-gray-500 text-xs">
          © 2025 Reddy Book. All rights reserved.
        </footer>

        {/* Admin Link */}
        <div className="pt-6 text-center">
          <a href="/admin" className="text-orange-500 font-bold underline">Go to Admin Panel</a>
        </div>
      </div>
    </div>
  );
};

export default Index;
