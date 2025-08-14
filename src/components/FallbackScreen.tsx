import { Button } from "@/components/ui/button";
export default function FallbackScreen() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-semibold">Algo deu errado</h2>
      <p className="mt-1 text-sm opacity-80">Tente recarregar a página.</p>
      <Button className="mt-4" onClick={() => location.reload()}>Recarregar</Button>
    </div>
  );
}
