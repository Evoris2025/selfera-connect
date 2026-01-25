import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Upload,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { VerificationIntent } from './IntentSelectionStep';

interface VerificationFormData {
  // Basics (all intents)
  display_name: string;
  handle: string;
  why_verify: string;
  
  // Creator specific
  content_categories: string[];
  primary_audience: string;
  examples_link: string;
  
  // Practitioner specific
  profession_type: string;
  registration_number: string;
  service_modes: string[];
  location: string;
  
  // Organisation specific
  organisation_name: string;
  website: string;
  service_types: string[];
  regions_served: string[];
  
  // Support seeker specific
  seeking_categories: string[];
  preferred_support_type: string;
  
  // Evidence
  evidence_url: string;
  
  // Terms
  terms_accepted: boolean;
}

const initialFormData: VerificationFormData = {
  display_name: '',
  handle: '',
  why_verify: '',
  content_categories: [],
  primary_audience: '',
  examples_link: '',
  profession_type: '',
  registration_number: '',
  service_modes: [],
  location: '',
  organisation_name: '',
  website: '',
  service_types: [],
  regions_served: [],
  seeking_categories: [],
  preferred_support_type: '',
  evidence_url: '',
  terms_accepted: false,
};

const contentCategoryOptions = [
  'Anxiety', 'Depression', 'Stress', 'Mindfulness', 'Self-care',
  'Men\'s Health', 'Women\'s Health', 'LGBTQ+', 'Relationships',
  'Grief', 'Trauma', 'Addiction', 'Eating Disorders', 'General Wellbeing',
];

const professionTypes = [
  'Counsellor', 'Psychologist', 'Psychiatrist', 'Social Worker',
  'Occupational Therapist', 'Psychotherapist', 'Art Therapist',
  'Music Therapist', 'Peer Support Worker', 'Other',
];

const serviceModeOptions = [
  'Telehealth', 'In-person', 'Hybrid',
];

const supportCategoryOptions = [
  'Anxiety & Stress', 'Depression', 'Relationships', 'Trauma',
  'Grief & Loss', 'Career & Work', 'Identity', 'General Support',
];

interface VerificationApplicationFormProps {
  intent: VerificationIntent;
  onSubmit: (data: VerificationFormData) => Promise<boolean>;
  onBack: () => void;
  isSubmitting: boolean;
  prefillData?: { display_name?: string; handle?: string };
}

export function VerificationApplicationForm({
  intent,
  onSubmit,
  onBack,
  isSubmitting,
  prefillData,
}: VerificationApplicationFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<VerificationFormData>({
    ...initialFormData,
    display_name: prefillData?.display_name || '',
    handle: prefillData?.handle || '',
  });

  const totalSteps = 4;

  const updateField = <K extends keyof VerificationFormData>(
    key: K,
    value: VerificationFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: keyof VerificationFormData, item: string) => {
    const current = formData[key] as string[];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateField(key, updated as any);
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const handleSubmit = async () => {
    if (!formData.terms_accepted) return;
    await onSubmit(formData);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.display_name.trim() && formData.why_verify.trim();
      case 2:
        if (intent === 'creator') {
          return formData.content_categories.length > 0;
        }
        if (intent === 'practitioner') {
          return formData.profession_type && formData.location.trim();
        }
        if (intent === 'organisation') {
          return formData.organisation_name.trim();
        }
        if (intent === 'support_seeker') {
          return formData.seeking_categories.length > 0;
        }
        return true;
      case 3:
        return true; // Evidence is optional
      case 4:
        return formData.terms_accepted;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              idx < step ? 'bg-primary' : 'bg-muted/30'
            )}
          />
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {/* Step 1: Basics */}
        {step === 1 && (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
              <p className="text-sm text-muted-foreground">
                Tell us about yourself
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={e => updateField('display_name', e.target.value)}
                  placeholder="Your name or organisation name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handle">Handle</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="handle"
                    value={formData.handle}
                    onChange={e => updateField('handle', e.target.value)}
                    placeholder="your_handle"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="why_verify">Why do you want to be verified? *</Label>
                <Textarea
                  id="why_verify"
                  value={formData.why_verify}
                  onChange={e => updateField('why_verify', e.target.value)}
                  placeholder="Tell us why verification matters to you..."
                  rows={3}
                />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Intent-specific questions */}
        {step === 2 && (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                {intent === 'creator' && 'Creator Details'}
                {intent === 'practitioner' && 'Professional Details'}
                {intent === 'organisation' && 'Organisation Details'}
                {intent === 'support_seeker' && 'Support Preferences'}
              </h3>
            </div>

            {intent === 'creator' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Content Categories *</Label>
                  <div className="flex flex-wrap gap-2">
                    {contentCategoryOptions.map(cat => (
                      <Badge
                        key={cat}
                        variant={formData.content_categories.includes(cat) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('content_categories', cat)}
                      >
                        {formData.content_categories.includes(cat) && (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_audience">Primary Audience</Label>
                  <Input
                    id="primary_audience"
                    value={formData.primary_audience}
                    onChange={e => updateField('primary_audience', e.target.value)}
                    placeholder="e.g., Young adults, Parents, Professionals"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examples_link">Link to Content Examples (optional)</Label>
                  <Input
                    id="examples_link"
                    type="url"
                    value={formData.examples_link}
                    onChange={e => updateField('examples_link', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {intent === 'practitioner' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profession Type *</Label>
                  <Select
                    value={formData.profession_type}
                    onValueChange={v => updateField('profession_type', v)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration/Membership Number (optional)</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={e => updateField('registration_number', e.target.value)}
                    placeholder="e.g., AHPRA 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Delivery Modes</Label>
                  <div className="flex flex-wrap gap-2">
                    {serviceModeOptions.map(mode => (
                      <Badge
                        key={mode}
                        variant={formData.service_modes.includes(mode) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('service_modes', mode)}
                      >
                        {formData.service_modes.includes(mode) && (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        {mode}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={e => updateField('location', e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>
            )}

            {intent === 'organisation' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organisation_name">Organisation Name *</Label>
                  <Input
                    id="organisation_name"
                    value={formData.organisation_name}
                    onChange={e => updateField('organisation_name', e.target.value)}
                    placeholder="Your organisation's legal name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={e => updateField('website', e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Counselling', 'Psychology', 'Psychiatry', 'Peer Support', 'Crisis Support', 'Community Programs'].map(type => (
                      <Badge
                        key={type}
                        variant={formData.service_types.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('service_types', type)}
                      >
                        {formData.service_types.includes(type) && (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regions_input">Regions Served</Label>
                  <Input
                    id="regions_input"
                    value={formData.regions_served.join(', ')}
                    onChange={e => updateField('regions_served', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g., Australia, New Zealand"
                  />
                </div>
              </div>
            )}

            {intent === 'support_seeker' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What support are you seeking? *</Label>
                  <div className="flex flex-wrap gap-2">
                    {supportCategoryOptions.map(cat => (
                      <Badge
                        key={cat}
                        variant={formData.seeking_categories.includes(cat) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('seeking_categories', cat)}
                      >
                        {formData.seeking_categories.includes(cat) && (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Support Type</Label>
                  <Select
                    value={formData.preferred_support_type}
                    onValueChange={v => updateField('preferred_support_type', v)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creator">Creator / Influencer</SelectItem>
                      <SelectItem value="practitioner">Practitioner</SelectItem>
                      <SelectItem value="organisation">Organisation</SelectItem>
                      <SelectItem value="any">No preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 3: Evidence upload */}
        {step === 3 && (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Evidence (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                Upload documents or provide a link to supporting evidence
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground/70">
                  PDF, JPG, PNG up to 10MB
                </p>
                <Button variant="secondary" size="sm" className="mt-4 rounded-full">
                  Browse Files
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">or</div>

              <div className="space-y-2">
                <Label htmlFor="evidence_url">Link to Evidence</Label>
                <Input
                  id="evidence_url"
                  type="url"
                  value={formData.evidence_url}
                  onChange={e => updateField('evidence_url', e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
          </>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Review & Submit</h3>
              <p className="text-sm text-muted-foreground">
                Confirm your details and submit your verification request
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card/60 border border-white/[0.06] space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Name</span>
                  <span className="text-sm font-medium">{formData.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Intent</span>
                  <Badge variant="secondary" className="capitalize">{intent.replace('_', ' ')}</Badge>
                </div>
                {formData.why_verify && (
                  <div>
                    <span className="text-muted-foreground text-sm block mb-1">Reason</span>
                    <p className="text-sm text-foreground">{formData.why_verify}</p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-amber-400">Estimated review time:</span> 2–5 days
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.terms_accepted}
                  onCheckedChange={checked => updateField('terms_accepted', checked === true)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that the information provided is accurate and I agree to SelfERA's 
                  verification terms. I understand that verification grants a trust badge and 
                  does not constitute endorsement.
                </Label>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="ghost"
          className="flex-1 rounded-full"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        {step < totalSteps ? (
          <Button
            className="flex-1 rounded-full"
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            className="flex-1 rounded-full"
            onClick={handleSubmit}
            disabled={!formData.terms_accepted || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
