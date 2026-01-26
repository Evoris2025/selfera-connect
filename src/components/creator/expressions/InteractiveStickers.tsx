import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, HelpCircle, Clock, MapPin, AtSign, Link2, Smile, ListChecks } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export type InteractiveStickerType = 
  | 'poll' 
  | 'question' 
  | 'quiz' 
  | 'countdown' 
  | 'location' 
  | 'mention' 
  | 'link' 
  | 'emoji_slider';

export interface InteractiveSticker {
  id: string;
  type: InteractiveStickerType;
  position: { x: number; y: number };
  data: PollData | QuestionData | QuizData | CountdownData | LocationData | MentionData | LinkData | EmojiSliderData;
}

export interface PollData {
  question: string;
  options: string[];
}

export interface QuestionData {
  prompt: string;
}

export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CountdownData {
  name: string;
  endTime: Date;
}

export interface LocationData {
  name: string;
  id?: string;
}

export interface MentionData {
  username: string;
  userId?: string;
}

export interface LinkData {
  url: string;
  label?: string;
}

export interface EmojiSliderData {
  question: string;
  emoji: string;
}

const STICKER_TYPES: { type: InteractiveStickerType; icon: React.ReactNode; label: string }[] = [
  { type: 'poll', icon: <BarChart3 className="w-6 h-6" />, label: 'Poll' },
  { type: 'question', icon: <HelpCircle className="w-6 h-6" />, label: 'Question' },
  { type: 'quiz', icon: <ListChecks className="w-6 h-6" />, label: 'Quiz' },
  { type: 'countdown', icon: <Clock className="w-6 h-6" />, label: 'Countdown' },
  { type: 'location', icon: <MapPin className="w-6 h-6" />, label: 'Location' },
  { type: 'mention', icon: <AtSign className="w-6 h-6" />, label: 'Mention' },
  { type: 'link', icon: <Link2 className="w-6 h-6" />, label: 'Link' },
  { type: 'emoji_slider', icon: <Smile className="w-6 h-6" />, label: 'Slider' },
];

interface InteractiveStickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sticker: InteractiveSticker) => void;
}

export function InteractiveStickerPicker({ isOpen, onClose, onAdd }: InteractiveStickerPickerProps) {
  const [activeType, setActiveType] = useState<InteractiveStickerType | null>(null);
  
  // Form state for each sticker type
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [countdownName, setCountdownName] = useState('');
  const [countdownDate, setCountdownDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [mentionUsername, setMentionUsername] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [sliderQuestion, setSliderQuestion] = useState('');
  const [sliderEmoji, setSliderEmoji] = useState('❤️');

  const resetForms = () => {
    setPollQuestion('');
    setPollOptions(['', '']);
    setQuestionPrompt('');
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrect(0);
    setCountdownName('');
    setCountdownDate('');
    setLocationName('');
    setMentionUsername('');
    setLinkUrl('');
    setLinkLabel('');
    setSliderQuestion('');
    setSliderEmoji('❤️');
    setActiveType(null);
  };

  const handleCreate = () => {
    if (!activeType) return;

    let data: InteractiveSticker['data'];
    
    switch (activeType) {
      case 'poll':
        if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) return;
        data = { question: pollQuestion, options: pollOptions.filter(o => o.trim()) } as PollData;
        break;
      case 'question':
        if (!questionPrompt.trim()) return;
        data = { prompt: questionPrompt } as QuestionData;
        break;
      case 'quiz':
        if (!quizQuestion.trim() || quizOptions.filter(o => o.trim()).length < 2) return;
        data = { 
          question: quizQuestion, 
          options: quizOptions.filter(o => o.trim()), 
          correctIndex: quizCorrect 
        } as QuizData;
        break;
      case 'countdown':
        if (!countdownName.trim() || !countdownDate) return;
        data = { name: countdownName, endTime: new Date(countdownDate) } as CountdownData;
        break;
      case 'location':
        if (!locationName.trim()) return;
        data = { name: locationName } as LocationData;
        break;
      case 'mention':
        if (!mentionUsername.trim()) return;
        data = { username: mentionUsername.replace('@', '') } as MentionData;
        break;
      case 'link':
        if (!linkUrl.trim()) return;
        data = { url: linkUrl, label: linkLabel || undefined } as LinkData;
        break;
      case 'emoji_slider':
        if (!sliderQuestion.trim()) return;
        data = { question: sliderQuestion, emoji: sliderEmoji } as EmojiSliderData;
        break;
    }

    const sticker: InteractiveSticker = {
      id: `sticker-${Date.now()}`,
      type: activeType,
      position: { x: 50, y: 50 },
      data,
    };

    onAdd(sticker);
    resetForms();
    onClose();
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const renderForm = () => {
    switch (activeType) {
      case 'poll':
        return (
          <div className="space-y-4">
            <Input
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask a question..."
              maxLength={80}
            />
            {pollOptions.map((option, i) => (
              <Input
                key={i}
                value={option}
                onChange={(e) => updatePollOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                maxLength={30}
              />
            ))}
            {pollOptions.length < 4 && (
              <Button variant="outline" size="sm" onClick={addPollOption}>
                + Add option
              </Button>
            )}
          </div>
        );
      
      case 'question':
        return (
          <Input
            value={questionPrompt}
            onChange={(e) => setQuestionPrompt(e.target.value)}
            placeholder="Ask me anything..."
            maxLength={80}
          />
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            <Input
              value={quizQuestion}
              onChange={(e) => setQuizQuestion(e.target.value)}
              placeholder="Quiz question..."
              maxLength={80}
            />
            {quizOptions.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => setQuizCorrect(i)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors",
                    quizCorrect === i 
                      ? "bg-green-500 border-green-500" 
                      : "border-muted-foreground"
                  )}
                />
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...quizOptions];
                    newOptions[i] = e.target.value;
                    setQuizOptions(newOptions);
                  }}
                  placeholder={`Option ${i + 1}`}
                  maxLength={30}
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Tap circle to mark correct answer
            </p>
          </div>
        );
      
      case 'countdown':
        return (
          <div className="space-y-4">
            <Input
              value={countdownName}
              onChange={(e) => setCountdownName(e.target.value)}
              placeholder="Event name..."
              maxLength={40}
            />
            <Input
              type="datetime-local"
              value={countdownDate}
              onChange={(e) => setCountdownDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        );
      
      case 'location':
        return (
          <Input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Search location..."
          />
        );
      
      case 'mention':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input
              value={mentionUsername}
              onChange={(e) => setMentionUsername(e.target.value)}
              placeholder="username"
              className="pl-8"
            />
          </div>
        );
      
      case 'link':
        return (
          <div className="space-y-4">
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <Input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Link text (optional)"
              maxLength={30}
            />
          </div>
        );
      
      case 'emoji_slider':
        return (
          <div className="space-y-4">
            <Input
              value={sliderQuestion}
              onChange={(e) => setSliderQuestion(e.target.value)}
              placeholder="How much do you...?"
              maxLength={80}
            />
            <div className="flex gap-2">
              {['❤️', '🔥', '😍', '😢', '👏', '💯'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSliderEmoji(emoji)}
                  className={cn(
                    "text-2xl p-2 rounded-lg transition-all",
                    sliderEmoji === emoji ? "bg-primary/20 scale-110" : "hover:bg-secondary"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-xl border-t border-border rounded-t-3xl z-50"
          style={{ height: activeType ? '60vh' : '40vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">
              {activeType ? STICKER_TYPES.find(s => s.type === activeType)?.label : 'Interactive'}
            </h3>
            <button
              onClick={() => activeType ? setActiveType(null) : onClose()}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ScrollArea className="h-[calc(100%-65px)]">
            {!activeType ? (
              // Sticker type grid
              <div className="grid grid-cols-4 gap-3 p-4">
                {STICKER_TYPES.map((sticker) => (
                  <motion.button
                    key={sticker.type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveType(sticker.type)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {sticker.icon}
                    </div>
                    <span className="text-xs font-medium">{sticker.label}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              // Sticker form
              <div className="p-4 space-y-4">
                {renderForm()}
                <Button
                  onClick={handleCreate}
                  className="w-full"
                >
                  Add {STICKER_TYPES.find(s => s.type === activeType)?.label}
                </Button>
              </div>
            )}
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Component to render placed interactive stickers
interface InteractiveStickerDisplayProps {
  sticker: InteractiveSticker;
  onRemove?: () => void;
}

export function InteractiveStickerDisplay({ sticker, onRemove }: InteractiveStickerDisplayProps) {
  const renderContent = () => {
    switch (sticker.type) {
      case 'poll': {
        const data = sticker.data as PollData;
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 min-w-[200px] shadow-lg">
            <p className="font-semibold text-gray-900 text-center mb-3">{data.question}</p>
            <div className="space-y-2">
              {data.options.map((option, i) => (
                <div 
                  key={i} 
                  className="bg-gray-100 rounded-xl py-2 px-4 text-center text-gray-700 font-medium"
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      case 'question': {
        const data = sticker.data as QuestionData;
        return (
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 min-w-[200px] shadow-lg">
            <p className="font-semibold text-white text-center mb-2">{data.prompt}</p>
            <div className="bg-white/20 rounded-xl py-2 px-4 text-center text-white/80 text-sm">
              Tap to respond
            </div>
          </div>
        );
      }
      
      case 'countdown': {
        const data = sticker.data as CountdownData;
        return (
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
            <p className="text-white font-semibold mb-1">{data.name}</p>
            <div className="flex gap-2 justify-center">
              <div className="bg-white/10 rounded-lg p-2">
                <span className="text-2xl font-bold text-white">00</span>
                <p className="text-xs text-white/60">Days</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <span className="text-2xl font-bold text-white">00</span>
                <p className="text-xs text-white/60">Hours</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <span className="text-2xl font-bold text-white">00</span>
                <p className="text-xs text-white/60">Mins</p>
              </div>
            </div>
          </div>
        );
      }
      
      case 'location': {
        const data = sticker.data as LocationData;
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="font-medium text-gray-900">{data.name}</span>
          </div>
        );
      }
      
      case 'mention': {
        const data = sticker.data as MentionData;
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span className="font-semibold text-gray-900">@{data.username}</span>
          </div>
        );
      }
      
      case 'link': {
        const data = sticker.data as LinkData;
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <Link2 className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-blue-600">{data.label || 'See more'}</span>
          </div>
        );
      }
      
      case 'emoji_slider': {
        const data = sticker.data as EmojiSliderData;
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 min-w-[200px] shadow-lg">
            <p className="font-semibold text-gray-900 text-center mb-3">{data.question}</p>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                {data.emoji}
              </div>
            </div>
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="relative cursor-move"
      whileHover={{ scale: 1.02 }}
    >
      {renderContent()}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
    </motion.div>
  );
}
