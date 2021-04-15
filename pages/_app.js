import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-gradient-to-r from-pink-light to-purple-dark">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
