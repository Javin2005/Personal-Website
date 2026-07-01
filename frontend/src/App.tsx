import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-2 h-[calc(100vh-4rem) pb-24] ">
        <h1 className="font-serif text-4xl text-cyan-500 font-bold:">
          Javin Carlson
        </h1>
        <h2 className="text-xl text-red-400"> Hello and Welcome!</h2>
      </div>
    </div>
  );
}

export default App;
