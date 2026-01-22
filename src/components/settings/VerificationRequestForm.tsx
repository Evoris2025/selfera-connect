import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Building2, Briefcase, ChevronLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useVerification, SubmitVerificationData } from '@/hooks/useVerification';

interface VerificationRequestFormProps {
  onBack: () => void;
}

export function VerificationRequestForm({ onBack }: VerificationRequestFormProps) {
  const { t } = useTranslation();
  const { myRequest, isLoading, isSubmitting, submitRequest } = useVerification();

  const [formData, setFormData] = useState<SubmitVerificationData>({
    account_type_requested: 'professional',
    display_name: '',
    country: '',
    credentials_summary: '',
    registration_number: '',
    website: '',
    proof_url: '',
    terms_accepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.terms_accepted) {
      return;
    }

    const success = await submitRequest(formData);
    if (success) {
      // Form will show status after refresh
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show existing request status
  if (myRequest) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Settings
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-verified/10">
                <BadgeCheck className="h-5 w-5 text-verified" />
              </div>
              <div>
                <CardTitle className="text-base">Verification Request</CardTitle>
                <CardDescription>Your request status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge 
                variant={
                  myRequest.status === 'approved' ? 'default' :
                  myRequest.status === 'rejected' ? 'destructive' : 'secondary'
                }
              >
                {myRequest.status === 'approved' && '✓ Approved'}
                {myRequest.status === 'pending' && '⏳ Under Review'}
                {myRequest.status === 'rejected' && '✗ Rejected'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-medium capitalize">{myRequest.account_type_requested}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span>{new Date(myRequest.created_at).toLocaleDateString()}</span>
            </div>

            {myRequest.status === 'approved' && (
              <div className="mt-4 p-4 rounded-lg bg-verified/10 border border-verified/20">
                <div className="flex items-center gap-2 text-verified">
                  <BadgeCheck className="h-5 w-5" />
                  <span className="font-medium">You are verified!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your verified badge is now visible on your profile and posts.
                </p>
              </div>
            )}

            {myRequest.status === 'rejected' && myRequest.admin_notes && (
              <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <span className="font-medium text-destructive">Reason:</span>
                <p className="text-sm text-muted-foreground mt-1">{myRequest.admin_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show request form
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ChevronLeft className="h-4 w-4" />
        Back to Settings
      </Button>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Get Verified</h2>
        <p className="text-muted-foreground">
          Verification is for mental health professionals and organisations who want to build trust with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Type</CardTitle>
            <CardDescription>What type of account are you applying for?</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.account_type_requested}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                account_type_requested: value as 'professional' | 'organization' 
              }))}
              className="space-y-3"
            >
              <div className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                <RadioGroupItem value="professional" id="professional" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="professional" className="flex items-center gap-2 cursor-pointer">
                    <Briefcase className="h-4 w-4 text-verified" />
                    Professional
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Licensed therapists, counselors, psychologists, and mental health practitioners.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                <RadioGroupItem value="organization" id="organization" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="organization" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="h-4 w-4 text-verified" />
                    Organisation
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mental health services, clinics, nonprofits, and support organisations.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">
                {formData.account_type_requested === 'organization' ? 'Organisation Name' : 'Full Name'} *
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder={formData.account_type_requested === 'organization' ? 'Your organisation name' : 'Your full name'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="e.g. United States, United Kingdom"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials">Credentials Summary *</Label>
              <Textarea
                id="credentials"
                value={formData.credentials_summary}
                onChange={(e) => setFormData(prev => ({ ...prev, credentials_summary: e.target.value }))}
                placeholder={formData.account_type_requested === 'organization' 
                  ? 'Describe your organisation, services offered, and accreditations...'
                  : 'List your qualifications, licenses, and areas of expertise...'}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration/License Number (if applicable)</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                placeholder="e.g. LMFT 12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website or Public Profile</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.terms_accepted}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  terms_accepted: checked === true 
                }))}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I confirm that the information provided is accurate and I agree to SelfERA's verification terms. 
                I understand that verification grants a trust badge and does not constitute endorsement.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button 
          type="submit" 
          className="w-full gap-2"
          disabled={!formData.terms_accepted || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <BadgeCheck className="h-4 w-4" />
              Submit Verification Request
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Verification requests are typically reviewed within 3-5 business days.
        </p>
      </form>
    </div>
  );
}
