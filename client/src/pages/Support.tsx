import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2, Mail, MessageSquare, HelpCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim() || !userEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (accountEmail && !emailRegex.test(accountEmail)) {
      toast({
        title: "Invalid Account Email",
        description: "Please enter a valid account email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/support", {
        subject: subject.trim(),
        description: description.trim(),
        userEmail: userEmail.trim(),
        accountEmail: accountEmail.trim() || undefined,
      });

      setIsSuccess(true);
      toast({
        title: "Message Sent",
        description: "Our support team will get back to you soon",
      });

      // Reset form
      setSubject("");
      setDescription("");
      setUserEmail("");
      setAccountEmail("");
    } catch (error: any) {
      toast({
        title: "Failed to Send",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f] p-4">
        <div className="max-w-lg mx-auto pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <GlassCard className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Message Sent Successfully!
              </h2>
              <p className="text-gray-400 mb-6">
                Thank you for contacting us. Our support team will review your message and get back to you within 24-48 hours.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setIsSuccess(false)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  Send Another Message
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full border-white/10">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f] p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Support</h1>
          <p className="text-sm text-gray-400">Get help with your account</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How can we help?</h3>
                <p className="text-sm text-gray-400">
                  Fill out the form below and our support team will respond within 24-48 hours.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Support Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Subject *
                </Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[120px] resize-none"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 text-right">
                  {description.length}/2000
                </p>
              </div>

              {/* User Email */}
              <div className="space-y-2">
                <Label htmlFor="userEmail" className="text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  Your Email *
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="Where should we reply?"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Account Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="accountEmail" className="text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Account Email
                  <span className="text-xs text-gray-500">(if different)</span>
                </Label>
                <Input
                  id="accountEmail"
                  type="email"
                  placeholder="Email used to create your BlockMint account"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium py-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </GlassCard>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">
                You can also reach us directly at:
              </p>
              <a 
                href="mailto:info@blockmint.app" 
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                info@blockmint.app
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
