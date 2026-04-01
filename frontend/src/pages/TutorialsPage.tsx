import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, BookOpen, Search, Loader2, VideoOff } from "lucide-react";
import { getAllTutorials } from "../api/tutorials";
import type { VideoTutorial } from "../interfaces/tutorial";

const categoryColors: Record<string, string> = {
  Nutrition: "bg-green-100 text-green-700",
  Vaccination: "bg-blue-100 text-blue-700",
  Growth: "bg-purple-100 text-purple-700",
  Safety: "bg-yellow-100 text-yellow-700",
  Development: "bg-pink-100 text-pink-700",
};

const getYoutubeThumbnail = (url: string): string | null => {
  try {
    const regExp =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regExp);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  } catch {}
  return null;
};

const TutorialCard = ({
  tutorial,
  onClick,
}: {
  tutorial: VideoTutorial;
  onClick: () => void;
}) => {
  const thumbnail = getYoutubeThumbnail(tutorial.url);
  const categoryStyle =
    tutorial.category && categoryColors[tutorial.category]
      ? categoryColors[tutorial.category]
      : "bg-[#fceaea] text-[#e5989b]";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#e5989b]/40 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-44 bg-[#fff5f7] flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={tutorial.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#e5989b]/60">
            <PlayCircle className="w-12 h-12" />
            <span className="text-xs">Video Tutorial</span>
          </div>
        )}
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center transition-all duration-300 scale-0 group-hover:scale-100">
            <PlayCircle className="w-7 h-7 text-[#e5989b]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {tutorial.category && (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${categoryStyle}`}
          >
            {tutorial.category}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#e5989b] transition-colors line-clamp-2">
          {tutorial.name}
        </h3>
      </div>
    </div>
  );
};

const TutorialsPage = () => {
  const [tutorials, setTutorials] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const data = await getAllTutorials();
        setTutorials(data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorials();
  }, []);

  const categories = [
    "All",
    ...(Array.from(
      new Set(tutorials.map((t) => t.category).filter(Boolean))
    ) as string[]),
  ];

  const filtered = tutorials.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCategory === "All" || t.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#fff5f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-[#fceaea] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#e5989b]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Video Tutorials</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">
            Learn more about child health, vaccinations, and parenting
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tutorials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#e5989b] focus:outline-none text-sm bg-white transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[#e5989b] text-white border-[#e5989b]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#e5989b]/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-[#e5989b] animate-spin" />
            <p className="text-gray-500 text-sm">Loading tutorials...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <VideoOff className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 text-sm">
              Failed to load tutorials. Please try again.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <VideoOff className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 text-sm">
              {search || selectedCategory !== "All"
                ? "No tutorials match your search."
                : "No tutorials available yet."}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                onClick={() => navigate(`/tutorials/${tutorial.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialsPage;