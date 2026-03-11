export default function Footer() {
  return (
    <footer className="py-8 mt-12 border-t border-gray-200 dark:border-gray-800 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        😂 This is just for fun! All predictions are randomly generated and
        fictional.
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        © {new Date().getFullYear()} After Marriage Prediction Generator. Made
        with 💖 & humor.
      </p>
    </footer>
  );
}
