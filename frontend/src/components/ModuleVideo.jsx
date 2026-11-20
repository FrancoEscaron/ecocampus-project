export default function ModuleVideo({ url, title = "Video del módulo" }) {
  if (!url || typeof url !== "string") return null;

  const limpiarUrl = url.trim();
  let videoId = "";

  const matchShorts = limpiarUrl.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  const matchWatch = limpiarUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  const matchEmbed = limpiarUrl.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  const matchYoutu = limpiarUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);

  if (matchShorts) videoId = matchShorts[1];
  else if (matchWatch) videoId = matchWatch[1];
  else if (matchEmbed) videoId = matchEmbed[1];
  else if (matchYoutu) videoId = matchYoutu[1];
  else if (/^[a-zA-Z0-9_-]{11}$/.test(limpiarUrl)) {
    videoId = limpiarUrl;
  }

  if (!videoId) {
    return (
      <div className="module-video-fallback">
        <a href={limpiarUrl} target="_blank" rel="noopener noreferrer">
          Ver video externo ({limpiarUrl})
        </a>
      </div>
    );
  }

  return (
    <div className="module-video-container">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
