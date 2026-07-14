import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Hr,
} from "@react-email/components"

interface Props {
  nombreComprador: string
  tituloSorteo: string
  puestos: number[]
  premioDescripcion: string
  fechaSorteo: string
  productoDescargaUrl?: string
  sorteoSlug: string
  nombreOrganizador: string
}

export function CompraConfirmadaEmail({
  nombreComprador,
  tituloSorteo,
  puestos,
  premioDescripcion,
  fechaSorteo,
  productoDescargaUrl,
  sorteoSlug,
  nombreOrganizador,
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#09090b", color: "#e4e4e7", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
          <Text style={{ fontSize: 24, fontWeight: 700, color: "#1a7a9e" }}>
            THOR
          </Text>

          <Text style={{ fontSize: 28, fontWeight: 700, marginTop: 32 }}>
            ¡Tu participación está confirmada!
          </Text>

          <Text style={{ color: "#a1a1aa", lineHeight: 1.6 }}>
            Hola {nombreComprador},
            has adquirido {puestos.length} bono{puestos.length > 1 ? "s" : ""} para el sorteo
            &quot;{tituloSorteo}&quot; organizado por {nombreOrganizador}.
          </Text>

          <Section style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            border: "1px solid #27272a",
            backgroundColor: "#18181b",
          }}>
            <Text style={{ fontSize: 14, color: "#71717a", margin: 0 }}>
              Tus puestos asignados
            </Text>
            <Text style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#1a7a9e",
              letterSpacing: 4,
              marginTop: 8,
            }}>
              # {puestos.join(" · ")}
            </Text>
          </Section>

          <Section style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: "#71717a", margin: 0 }}>
              Premio
            </Text>
            <Text style={{ fontSize: 16, color: "#e4e4e7", marginTop: 4 }}>
              {premioDescripcion}
            </Text>
          </Section>

          <Section style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: "#71717a", margin: 0 }}>
              Fecha del sorteo en vivo
            </Text>
            <Text style={{ fontSize: 16, color: "#e4e4e7", marginTop: 4 }}>
              {fechaSorteo}
            </Text>
          </Section>

          {productoDescargaUrl && (
            <Section style={{ marginTop: 24 }}>
              <Button
                href={productoDescargaUrl}
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  borderRadius: 8,
                  backgroundColor: "#1a7a9e",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Descargar producto digital
              </Button>
              <Text style={{ fontSize: 12, color: "#52525b", marginTop: 8 }}>
                El enlace expirará en 24 horas.
              </Text>
            </Section>
          )}

          <Hr style={{ borderColor: "#27272a", marginTop: 32 }} />

          <Text style={{ fontSize: 12, color: "#52525b", textAlign: "center" }}>
            Thor — Sorteos gamificados en vivo
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
