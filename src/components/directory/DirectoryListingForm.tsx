import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2, Globe, Building2 } from 'lucide-react';

interface DirectoryListingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEntry?: {
    id: string;
    name: string;
    description: string | null;
    regions_served: string[] | null;
    delivery_type: string | null;
    price_range: string | null;
    languages_supported: string[] | null;
    tags: string[] | null;
    links: any;
  } | null;
  onSuccess: () => void;
}

const DELIVERY_TYPES = [
  { value: 'online', label: 'Online Only' },
  { value: 'in_person', label: 'In-Person Only' },
  { value: 'hybrid', label: 'Hybrid (Online & In-Person)' },
];

const PRICE_RANGES = [
  { value: 'free', label: 'Free' },
  { value: 'sliding_scale', label: 'Sliding Scale' },
  { value: 'low_cost', label: 'Low Cost' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

const PROVIDER_TAGS = [
  'Counsellor',
  'Psychologist',
  'Psychiatrist',
  'Social Worker',
  'Peer Support',
  'Mental Health Coach',
  'Therapist',
  'Wellbeing Organisation',
  'Anxiety',
  'Depression',
  'Trauma',
  'PTSD',
  'Grief',
  'Relationships',
  'Youth',
  'LGBTQ+',
  'Culturally Diverse',
  'Neurodivergent',
];

const COMMON_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'Mandarin',
  'Hindi',
  'Arabic',
  'Portuguese',
  'Indonesian',
  'German',
  'Japanese',
];

export function DirectoryListingForm({
  open,
  onOpenChange,
  existingEntry,
  onSuccess,
}: DirectoryListingFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!existingEntry;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(existingEntry?.name || '');
  const [description, setDescription] = useState(existingEntry?.description || '');
  const [deliveryType, setDeliveryType] = useState(existingEntry?.delivery_type || '');
  const [priceRange, setPriceRange] = useState(existingEntry?.price_range || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingEntry?.tags || []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    existingEntry?.languages_supported || ['English']
  );
  const [regions, setRegions] = useState<string[]>(existingEntry?.regions_served || []);
  const [newRegion, setNewRegion] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(
    existingEntry?.links?.website || ''
  );

  const handleAddRegion = () => {
    if (newRegion.trim() && !regions.includes(newRegion.trim())) {
      setRegions([...regions, newRegion.trim()]);
      setNewRegion('');
    }
  };

  const handleRemoveRegion = (region: string) => {
    setRegions(regions.filter((r) => r !== region));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!name.trim()) {
      toast.error('Please enter a name for your listing');
      return;
    }

    if (selectedTags.length === 0) {
      toast.error('Please select at least one service tag');
      return;
    }

    setIsSubmitting(true);

    try {
      const listingData = {
        owner_user_id: user.id,
        owner_profile_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        regions_served: regions.length > 0 ? regions : null,
        delivery_type: deliveryType || null,
        price_range: priceRange || null,
        languages_supported: selectedLanguages.length > 0 ? selectedLanguages : null,
        tags: selectedTags,
        links: websiteUrl ? { website: websiteUrl } : null,
        verified: true, // Verified providers create verified listings
      };

      if (isEditing && existingEntry?.id) {
        const { error } = await supabase
          .from('service_directory_entries')
          .update(listingData)
          .eq('id', existingEntry.id);

        if (error) throw error;
        toast.success('Listing updated successfully');
      } else {
        const { error } = await supabase
          .from('service_directory_entries')
          .insert(listingData);

        if (error) throw error;
        toast.success('Listing created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving listing:', error);
      toast.error(error.message || 'Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {isEditing ? 'Edit Directory Listing' : 'Create Directory Listing'}
          </DialogTitle>
          <DialogDescription>
            Create your listing to appear in the SelfERA Directory. Users will be able to
            discover and connect with you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or organisation name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your services, approach, and who you help..."
              rows={4}
              maxLength={500}
            />
            <p className="text-label text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          {/* Service Tags */}
          <div className="space-y-2">
            <Label>Service Tags *</Label>
            <p className="text-label text-muted-foreground">
              Select tags that describe your services
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {PROVIDER_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Delivery Type */}
          <div className="space-y-2">
            <Label>Delivery Type</Label>
            <Select value={deliveryType} onValueChange={setDeliveryType}>
              <SelectTrigger>
                <SelectValue placeholder="How do you offer services?" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Approximate pricing" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Languages Supported</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COMMON_LANGUAGES.map((lang) => (
                <Badge
                  key={lang}
                  variant={selectedLanguages.includes(lang) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* Regions Served */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Regions Served
            </Label>
            <div className="flex gap-2">
              <Input
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder="Add country or region..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRegion();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddRegion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {regions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {regions.map((region) => (
                  <Badge key={region} variant="secondary" className="gap-1">
                    {region}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveRegion(region)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Trust Notice */}
          <div className="bg-muted/50 rounded-lg p-4 text-body text-muted-foreground">
            <p>
              By creating a listing, you confirm that you are a qualified professional or
              legitimate organisation. SelfERA facilitates discovery only — all services
              are provided independently.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Listing'
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
