import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }) {
  return (
    // <div className="bg-gradient-to-r from-purples-light to-purples-dark">
    <Component {...pageProps} />
    // </div>
  );
}

export default MyApp;
