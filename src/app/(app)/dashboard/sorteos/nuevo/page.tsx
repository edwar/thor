import { createSorteo } from "@/lib/actions/sorteos"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/form-select"

export default function NuevoSorteoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Crear nuevo sorteo</h1>
        <p className="mt-1 text-muted-foreground">
          Configura los detalles del sorteo y el producto digital.
        </p>
      </div>

      <form action={createSorteo} className="space-y-10">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Información del sorteo</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título del sorteo</Label>
              <Input id="titulo" name="titulo" required placeholder="Ej: Gana el curso completo de React" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" name="descripcion" rows={3} placeholder="Describe el sorteo y el premio..." />
            </div>
          </div>
        </section>

        <hr className="border-border/50" />

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Premio y bonos</h2>
          <div className="mt-4 space-y-4">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="premioFijo">Valor del premio fijo (COP)</Label>
                <Input id="premioFijo" name="premioFijo" type="number" min={0} placeholder="Ej: 5000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="porcentajePremio">Porcentaje del recaudo</Label>
                <Input id="porcentajePremio" name="porcentajePremio" type="number" min={0} max={100} placeholder="Ej: 50" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="precioBono">Precio por bono (COP)</Label>
                <Input id="precioBono" name="precioBono" type="number" min={1000} required placeholder="Ej: 20000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalBonos">Capacidad máxima de bonos</Label>
                <Input id="totalBonos" name="totalBonos" type="number" min={1} required placeholder="Ej: 500" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rangoPuestosMin">Puesto mínimo</Label>
                <Input id="rangoPuestosMin" name="rangoPuestosMin" type="number" defaultValue={10000} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rangoPuestosMax">Puesto máximo</Label>
                <Input id="rangoPuestosMax" name="rangoPuestosMax" type="number" defaultValue={99999} />
              </div>
            </div>
          </div>
        </section>

        <hr className="border-border/50" />

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Fechas</h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </section>

        <div className="flex justify-end gap-4 border-t border-border/50 pt-6">
          <Button type="submit" className="bg-thor-600 text-white hover:bg-thor-500">
            Crear sorteo
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/sorteos" />} className="cursor-default">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
