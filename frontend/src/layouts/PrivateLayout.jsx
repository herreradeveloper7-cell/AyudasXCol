import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function PrivateLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        AyudasXCol · Proyecto de grado UNAD · Prototipo académico
      </footer>
    </div>
  );
}
