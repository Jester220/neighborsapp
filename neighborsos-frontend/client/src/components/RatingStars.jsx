export default function RatingStars({ value = 0, onChange, interactive = false, size = 'text-base' }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          aria-label={`${star} star`}
        >
          <span className={star <= value ? 'text-coral' : 'text-line'}>★</span>
        </button>
      ))}
    </span>
  );
}
