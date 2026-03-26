import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";
import { GlassCard } from "@/components/GlassCard";
import { IOSStatusBar, IOSHomeIndicator } from "@/components/IOSStatusBar";
import { Button } from "@/components/ui/button";

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <IOSStatusBar />
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-md mx-auto px-4 pt-16 pb-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-6"
        >
          <Link href="/">
            <Button 
              variant="ghost" 
              size="icon" 
              className="liquid-glass"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">Last Updated: January 2026</p>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <GlassCard delay={0.15} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing or using BlockMint ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. BlockMint is operated by BlockMint Mining and provides cryptocurrency hashpower mining services and related features.
            </p>
          </GlassCard>

          <GlassCard delay={0.2} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Eligibility</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>You must meet the following requirements to use BlockMint:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Be at least 18 years of age or the legal age of majority in your jurisdiction</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using the Service under applicable laws</li>
                <li>Comply with all local, state, national, and international laws and regulations</li>
              </ul>
              <p>By using the Service, you represent and warrant that you meet these eligibility requirements.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.25} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Account Registration</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>To use certain features of the Service, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not share your account with others or allow unauthorized access</li>
                <li>Immediately notify us of any unauthorized use or security breach</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.3} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Mining Services</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Hashpower Purchases:</strong> You can purchase hashpower to participate in cryptocurrency mining. All purchases are final and non-refundable unless otherwise stated.</p>
              <p><strong className="text-foreground">Mining Rewards:</strong> Mining rewards are distributed based on your hashpower contribution and pool performance. Rewards are not guaranteed and depend on network difficulty, block rewards, and other factors beyond our control.</p>
              <p><strong className="text-foreground">Payouts:</strong> Minimum payout thresholds apply. We reserve the right to adjust payout schedules and thresholds with reasonable notice.</p>
              <p><strong className="text-foreground">Service Interruptions:</strong> We strive for 99% uptime but do not guarantee uninterrupted service. Maintenance, technical issues, or force majeure events may cause temporary service disruptions.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.35} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Fees And Payments</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Service Fees:</strong> We charge fees for hashpower, mining pool participation, and transaction processing. All fees are clearly disclosed before purchase.</p>
              <p><strong className="text-foreground">Payment Methods:</strong> We accept cryptocurrency payments. You are responsible for any blockchain transaction fees (gas fees).</p>
              <p><strong className="text-foreground">Taxes:</strong> You are responsible for determining and paying any applicable taxes related to your use of the Service.</p>
              <p><strong className="text-foreground">Fee Changes:</strong> We may modify fees with 30 days' notice. Continued use of the Service after fee changes constitutes acceptance.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.4} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Cryptocurrency Risks</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>You acknowledge and accept the following risks associated with cryptocurrency:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Cryptocurrency values are highly volatile and may result in significant losses</li>
                <li>Mining profitability varies based on network difficulty, block rewards, and cryptocurrency prices</li>
                <li>Regulatory changes may impact cryptocurrency mining and transactions</li>
                <li>Blockchain transactions are irreversible once confirmed</li>
                <li>You are responsible for the security of your cryptocurrency wallets and private keys</li>
              </ul>
              <p className="mt-3"><strong className="text-foreground">BlockMint is not a financial advisor.</strong> We do not provide investment advice or guarantee returns. You should consult with qualified professionals before making financial decisions.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.45} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Prohibited Activities</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use the Service for illegal activities, including money laundering or fraud</li>
                <li>Violate any local, state, national, or international laws</li>
                <li>Impersonate others or misrepresent your affiliation</li>
                <li>Interfere with or disrupt the Service or its servers and networks</li>
                <li>Attempt to gain unauthorized access to accounts, systems, or networks</li>
                <li>Use automated tools (bots, scrapers) without permission</li>
                <li>Manipulate mining operations or engage in fraudulent mining activities</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Create multiple accounts to circumvent restrictions</li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard delay={0.5} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Intellectual Property</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>The Service, including its content, features, and functionality, is owned by BlockMint Mining and protected by international copyright, trademark, and other intellectual property laws.</p>
              <p>You are granted a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or lease any part of the Service without our written permission.</p>
              <p>BlockMint, our logo, and other marks are trademarks of BlockMint Mining. You may not use our trademarks without prior written consent.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.55} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">9. User Content</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>If you submit feedback, suggestions, or other content to us, you grant us a worldwide, royalty-free, perpetual license to use, modify, and incorporate such content without compensation.</p>
              <p>You retain ownership of any personal data you provide, subject to our Privacy Policy. We will handle your personal information in accordance with applicable data protection laws.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.6} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Disclaimers</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p className="uppercase font-semibold text-foreground">The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.</p>
              <p>We disclaim all warranties, including but not limited to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Merchantability, fitness for a particular purpose, and non-infringement</li>
                <li>Uninterrupted, secure, or error-free service</li>
                <li>Accuracy, reliability, or completeness of information</li>
                <li>Guaranteed mining returns or profitability</li>
              </ul>
              <p>We do not warrant that the Service will meet your requirements or that defects will be corrected.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.65} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Limitation of Liability</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p className="uppercase font-semibold text-foreground">To the maximum extent permitted by law, BlockMint and BlockMint Mining shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Loss of profits, revenue, or expected mining returns</li>
                <li>Loss of data or cryptocurrency</li>
                <li>Business interruption or service disruptions</li>
                <li>Loss of goodwill or reputation</li>
              </ul>
              <p>Our total liability to you for any claims arising from your use of the Service shall not exceed the amount you paid to us in the 12 months preceding the claim.</p>
              <p className="mt-3">Some jurisdictions do not allow limitations on liability, so these limitations may not apply to you.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.7} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Indemnification</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless BlockMint, BlockMint Mining, and their officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from: (a) your use of the Service, (b) your violation of these Terms, (c) your violation of any rights of third parties, or (d) any fraudulent or illegal activities.
            </p>
          </GlassCard>

          <GlassCard delay={0.75} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Termination</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>We may suspend or terminate your account and access to the Service at any time, with or without cause or notice, for violations of these Terms or other reasons at our sole discretion.</p>
              <p>You may terminate your account by contacting support. Upon termination:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your right to use the Service will immediately cease</li>
                <li>We may delete your account data (subject to legal retention requirements)</li>
                <li>Any outstanding balances may be forfeited or subject to payout conditions</li>
                <li>Provisions that should survive termination will remain in effect</li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard delay={0.8} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">14. Dispute Resolution</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Informal Resolution:</strong> Before filing a claim, you agree to contact us at info@blockmint.app to attempt to resolve the dispute informally for at least 30 days.</p>
              <p><strong className="text-foreground">Arbitration:</strong> Any disputes that cannot be resolved informally shall be resolved through binding arbitration in accordance with the laws of the United Arab Emirates. The arbitration will be conducted in English.</p>
              <p><strong className="text-foreground">Class Action Waiver:</strong> You agree to resolve disputes individually and waive any right to participate in class actions or representative proceedings.</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.85} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">15. Governing Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates, without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction of the courts located in the UAE for any disputes arising from these Terms.
            </p>
          </GlassCard>

          <GlassCard delay={0.9} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">16. Changes to Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.
            </p>
          </GlassCard>

          <GlassCard delay={0.95} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">17. Severability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect. The invalid provision will be modified to the minimum extent necessary to make it valid and enforceable.
            </p>
          </GlassCard>

          <GlassCard delay={1.0} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">18. Entire Agreement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms, together with our Privacy Policy and any other legal notices published by us, constitute the entire agreement between you and BlockMint regarding the Service and supersede all prior agreements and understandings.
            </p>
          </GlassCard>

          <GlassCard delay={1.05} className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">19. Contact Information</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <p><strong className="text-foreground">BlockMint</strong></p>
              <p>Operated by BlockMint Mining</p>
              <p>Email: info@blockmint.app</p>
              <p>Website: blockmint.app</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-muted-foreground">BlockMint App By BlockMint Mining</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary">
              ©
            </span>
          </div>
        </motion.footer>
      </main>
      
      <IOSHomeIndicator />
    </div>
  );
}
