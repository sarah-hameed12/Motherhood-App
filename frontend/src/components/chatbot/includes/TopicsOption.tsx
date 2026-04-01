import { useState } from 'react';
import { X, Syringe, ClipboardList, Baby, Milk, MessageCircle, Sparkles } from 'lucide-react';
import { postRequest } from '../../../api/requests';


interface TopicsOptionsProps {
  onClose: () => void;
  onSelectTopic: (topic: { id: string; title: string; greeting: string; exampleQuestions?: string[] }) => void;
}

const topics = [
  {
    id: 'vaccinations',
    title: 'General Vaccinations',
    description: 'Learn about vaccines, schedules, side effects, and safety',
    icon: <Syringe className="w-6 h-6" />,
    emoji: '💉',
    greeting: "Hello! 👋 I'm your vaccination assistant. I can help you with:\n\n• Vaccine schedules and timing\n• Common side effects and what to expect\n• Vaccine safety and effectiveness\n• Recommended vaccines by age\n• Travel vaccinations\n\nWhat would you like to know about vaccines?",
    exampleQuestions: [
      "What vaccines does my baby need at 2 months?",
      "Are there any side effects of the MMR vaccine?",
      "When should my child get the flu shot?",
      "Is it safe to delay vaccines?"
    ],
    color: 'from-blue-400 to-blue-500',
    bg: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-600',
  },
  {
    id: 'vaccine-records',
    title: 'Child Vaccine Record',
    description: 'Track, manage, and organize your child\'s vaccination history',
    icon: <ClipboardList className="w-6 h-6" />,
    emoji: '📋',
    greeting: "Hi! 📋 I'll help you manage your child's vaccine records. I can assist with:\n\n• Tracking upcoming vaccinations\n• Understanding your child's vaccine history\n• Organizing vaccination certificates\n• Setting reminders for due vaccines\n• Exporting or sharing records\n\nHow can I help with your child's vaccine records today?",
    exampleQuestions: [
      "What vaccines are due next?",
      "Show me my child's vaccination history",
      "When was the last MMR vaccine given?",
      "How do I add a new vaccine record?"
    ],
    color: 'from-purple-400 to-purple-500',
    bg: 'bg-purple-50 hover:bg-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-600',
  },
  {
    id: 'parenting',
    title: 'General Parenting',
    description: 'Daily parenting tips, behavior guidance, and developmental support',
    icon: <Baby className="w-6 h-6" />,
    emoji: '👶',
    greeting: "Hello! 👶 I'm here to support you with parenting advice. I can help with:\n\n• Sleep training and routines\n• Behavior management\n• Developmental milestones\n• Potty training tips\n• Managing tantrums\n• Sibling relationships\n\nWhat parenting challenge can I help you with today?",
    exampleQuestions: [
      "How can I help my baby sleep through the night?",
      "What are normal tantrums for a 2-year-old?",
      "When should I start potty training?",
      "How do I handle picky eating?"
    ],
    color: 'from-[#e5989b] to-[#d88a8d]',
    bg: 'bg-[#fceaea] hover:bg-[#f8dede]',
    border: 'border-[#e5989b]',
    text: 'text-[#e5989b]',
  },
  {
    id: 'growth',
    title: 'Child Growth',
    description: 'Nutrition, feeding, growth charts, and developmental tracking',
    icon: <Milk className="w-6 h-6" />,
    emoji: '📈',
    greeting: "Hi there! 📈 I'm your child growth and nutrition assistant. I can help with:\n\n• Breastfeeding support\n• Formula feeding guidance\n• Introducing solid foods\n• Growth chart interpretation\n• Portion sizes and nutrition\n• Picky eating solutions\n\nWhat would you like to know about your child's growth and nutrition?",
    exampleQuestions: [
      "When should I introduce solid foods?",
      "Is my baby gaining weight normally?",
      "How much formula should my 4-month-old drink?",
      "What are good first foods for my baby?"
    ],
    color: 'from-amber-400 to-amber-500',
    bg: 'bg-amber-50 hover:bg-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-600',
  },
];

const TopicsOptions = ({ onClose, onSelectTopic }: TopicsOptionsProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const handleTopicClick = async (topic: typeof topics[0]) => {
    setLoadingId(topic.id);
    try {
      await postRequest('/llm/conversations', { topic: topic.title });
      onSelectTopic({
        id: topic.id,
        title: topic.title,
        greeting: topic.greeting,
        exampleQuestions: topic.exampleQuestions,
      });
    } catch (err) {
      console.error('Failed to create conversation:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#e5989b]" />
              <h2 className="text-xl font-bold text-gray-800">Start a New Conversation</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Choose a topic and get personalized guidance
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={!!loadingId}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`rounded-xl border transition-all duration-200 ${
                expandedTopic === topic.id ? 'shadow-lg' : 'hover:shadow-md'
              } ${topic.bg} ${topic.border}`}
            >
              <button
                onClick={() => handleTopicClick(topic)}
                disabled={!!loadingId}
                className="w-full p-4 text-left disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${topic.color} rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                    {loadingId === topic.id ? (
                      <svg className="animate-spin w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      topic.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{topic.emoji}</span>
                      <h3 className={`font-semibold ${topic.text}`}>{topic.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                  </div>
                </div>
              </button>
              
              {/* Expandable section with example questions */}
              <button
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                className="w-full px-4 pb-3 text-left"
              >
                <div className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#e5989b] transition-colors">
                  <MessageCircle className="w-3 h-3" />
                  <span>{expandedTopic === topic.id ? 'Hide examples' : 'Show example questions'}</span>
                </div>
              </button>
              
              {expandedTopic === topic.id && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100/50">
                  <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#e5989b]" />
                    Try asking:
                  </p>
                  <div className="space-y-1.5">
                    {topic.exampleQuestions?.map((question, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-gray-600 bg-white/50 rounded-lg px-3 py-1.5 hover:bg-white cursor-pointer transition-colors"
                        onClick={() => {
                          // Set the question in the input field and close modal
                          // You'll need to pass a function to handle this
                          onSelectTopic({
                            id: topic.id,
                            title: topic.title,
                            greeting: topic.greeting,
                            exampleQuestions: topic.exampleQuestions,
                          });
                          onClose();
                        }}
                      >
                        💬 {question}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#e5989b] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600">
                <p className="font-medium text-gray-700">✨ Pro Tip</p>
                <p>Be as specific as possible when asking questions. Include your child's age, any concerns, and what you'd like to learn about for the most helpful responses!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicsOptions;