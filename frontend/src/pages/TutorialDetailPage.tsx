


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { getTutorialById } from "../api/tutorials";
import type { VideoTutorial } from "../interfaces/tutorial";

const categoryColors: Record<string, string> = {
  Nutrition: "bg-green-100 text-green-700",
  Vaccination: "bg-blue-100 text-blue-700",
  Growth: "bg-purple-100 text-purple-700",
  Safety: "bg-yellow-100 text-yellow-700",
  Development: "bg-pink-100 text-pink-700",
};

const getEmbedUrl = (url: string): string | null => {
  try {
    const ytRegExp =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const ytMatch = url.match(ytRegExp);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  } catch {
    return null;
  }
};

const TutorialDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState<VideoTutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTutorial = async () => {
      try {
        const data = await getTutorialById(id);
        setTutorial(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, [id]);

  const embedUrl = tutorial ? getEmbedUrl(tutorial.url) : null;

  const categoryStyle =
    tutorial?.category && categoryColors[tutorial.category]
      ? categoryColors[tutorial.category]
      : "bg-[#fceaea] text-[#e5989b]";

  return (
    <div className="min-h-screen bg-[#fff5f7]">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/tutorials")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#e5989b] transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tutorials
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-[#e5989b] animate-spin" />
            <p className="text-gray-500 text-sm">Loading tutorial...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <AlertCircle className="w-10 h-10 text-red-300" />
            <p className="text-gray-500 text-sm">Tutorial not found or failed to load.</p>
            <button
              onClick={() => navigate("/tutorials")}
              className="mt-2 px-4 py-2 bg-[#e5989b] text-white rounded-xl text-sm hover:bg-[#d88a8d] transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {!loading && !error && tutorial && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-full aspect-video bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={tutorial.name}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  frameBorder="0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/60">
                  <AlertCircle className="w-10 h-10" />
                  <p className="text-sm">Unable to embed this video.</p>
                  <a
                    href={tutorial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in new tab
                  </a>
                </div>
              )}
            </div>

            <div className="p-6">
              {tutorial.category && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyle}`}>
                    {tutorial.category}
                  </span>
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-4">
                {tutorial.name}
              </h1>

              <a
                href={tutorial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#e5989b] hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open original link
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialDetailPage;
