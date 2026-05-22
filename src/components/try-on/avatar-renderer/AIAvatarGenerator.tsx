import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AvatarConfig, createDefaultAvatarConfig } from '../avatar-creator/avatarPresets';

interface AIAvatarGeneratorProps {
  onGenerate: (config: AvatarConfig) => void;
  onBack: () => void;
}

const EXAMPLE_PROMPTS = [
  "A tall athletic woman with brown skin and curly black hair",
  "A slim guy, about 5'10, with a beard and short brown hair",
  "A curvy person with medium height, light skin, and blonde hair",
  "An athletic man with dark skin and a buzz cut",
];

/**
 * AIAvatarGenerator - Text-to-avatar using Lovable AI
 * 
 * Allows users to describe their avatar in natural language
 * and generates appropriate configuration using AI.
 */
export const AIAvatarGenerator = ({ onGenerate, onBack }: AIAvatarGeneratorProps) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe your avatar');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-avatar-config', {
        body: { description: description.trim() }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate avatar');
      }

      if (!data || !data.config) {
        throw new Error('Invalid response from AI');
      }

      // Merge AI-generated config with defaults
      const baseConfig = createDefaultAvatarConfig(data.config.gender || 'male');
      const generatedConfig: AvatarConfig = {
        ...baseConfig,
        id: `ai-${Date.now()}`,
        name: 'AI Avatar',
        method: 'ai-generated' as 'photo' | 'manual' | 'library',
        gender: data.config.gender || baseConfig.gender,
        skinTone: data.config.skinTone || baseConfig.skinTone,
        body: {
          ...baseConfig.body,
          ...data.config.body,
        },
        face: {
          ...baseConfig.face,
          ...data.config.face,
        },
        hair: {
          ...baseConfig.hair,
          ...data.config.hair,
        },
      };

      onGenerate(generatedConfig);
    } catch (err) {
      console.error('[AIAvatarGenerator] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate avatar. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setDescription(prompt);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Wand2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-light tracking-tight">Describe Your Avatar</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself and AI will create your avatar
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="E.g., 'A tall athletic woman with brown skin and curly black hair' or 'A slim guy, about 5'10, with a beard'"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError(null);
          }}
          className="min-h-[100px] resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* Example prompts */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.slice(0, 2).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(prompt)}
              disabled={isGenerating}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-foreground/50 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {prompt.slice(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isGenerating}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="flex-1 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Avatar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
