function Footer() {
  return (
    <footer className="py-12 border-t border-slate-900 text-center">
      <p className="text-slate-500 text-sm font-mono">
        Built with <span className="text-cyan-500">FastAPI</span> &{" "}
        <span className="text-blue-500">React</span>
      </p>
      <p className="text-slate-600 text-[10px] mt-2 uppercase tracking-widest">
        © {new Date().getFullYear()} Christian J Carlson
      </p>
    </footer>
  );
}
export default Footer;
