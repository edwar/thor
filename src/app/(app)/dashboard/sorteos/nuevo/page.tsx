import { createSorteo } from "@/lib/actions/sorteos"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/form-select"

export default function NuevoSorteoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Crear nuevo sorteo</h1>
        <p className="mt-1 text-zinc-400">
          Configura los detalles del sorteo y el producto digital.
        </p>
      </div>

      <form action={createSorteo} className="space-y-8">
        <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-100">Información del sorteo</h2>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título del sorteo</Label>
            <Input id="titulo" name="titulo" required placeholder="Ej: Gana el curso completo de React" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" rows={3} placeholder="Describe el sorteo y el premio..." />
          </div>
        </section>

        <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-100">Premio y bonos</h2>

          <div className="space-y-2">
            <Label htmlFor="tipoPremio">Tipo de premio</Label>
            <FormSelect
              name="tipoPremio"
              required
              defaultValue="FIJO"
              options={[
                { value: "FIJO", label: "Premio fijo" },
                { value: "PORCENTAJE", label: "% del recaudo" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="premioFijo">Valor del premio fijo (COP)</Label>
            <Input id="premioFijo" name="premioFijo" type="number" min={0} placeholder="Ej: 5000000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="porcentajePremio">Porcentaje del recaudo</Label>
            <Input id="porcentajePremio" name="porcentajePremio" type="number" min={0} max={100} placeholder="Ej: 50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precioBono">Precio por bono (COP)</Label>
            <Input id="precioBono" name="precioBono" type="number" min={1000} required placeholder="Ej: 20000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalBonos">Capacidad máxima de bonos</Label>
            <Input id="totalBonos" name="totalBonos" type="number" min={1} required placeholder="Ej: 500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rangoPuestosMin">Puesto mínimo</Label>
              <Input id="rangoPuestosMin" name="rangoPuestosMin" type="number" defaultValue={10000} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rangoPuestosMax">Puesto máximo</Label>
              <Input id="rangoPuestosMax" name="rangoPuestosMax" type="number" defaultValue={99999} />
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-100">Fechas</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Inicio de venta</Label>
              <Input id="fechaInicio" name="fechaInicio" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaCierre">Cierre de venta</Label>
              <Input id="fechaCierre" name="fechaCierre" type="datetime-local" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaSorteo">Fecha del sorteo en vivo</Label>
            <Input id="fechaSorteo" name="fechaSorteo" type="datetime-local" required />
          </div>
        </section>

        <div className="flex gap-4">
          <Button type="submit" className="bg-thor-600 hover:bg-thor-500">
            Crear sorteo
          </Button>
          <a
            href="/dashboard/sorteos"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
