const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto shrink-0 z-10 w-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} CodeBook. All rights reserved.
          <br />
          Authored by: Nitin Yadav |{" "}
          <a
            href="https://thesunrisejnp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 transition-colors hover:underline"
          >
            The Sunrise Public School
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
