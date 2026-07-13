export function renderCuentaCobroHTML(params: {
  nombreOrganizador: string
  slug: string
  tituloSorteo: string
  totalRecaudado: string
  comisionPct: string
  montoComision: string
  totalBonosVendidos: number
  fechaSorteo: string
  fechaEmision: string
  referencia: string
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #09090b;
      color: #e4e4e7;
      padding: 40px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 40px;
      background: #18181b;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .header h1 {
      font-size: 14px;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    .header h2 {
      font-size: 22px;
      font-weight: 700;
    }
    .ref {
      text-align: center;
      font-size: 12px;
      color: #52525b;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 10px 0;
      font-size: 14px;
    }
    td:last-child {
      text-align: right;
    }
    .label {
      color: #71717a;
    }
    .value {
      color: #e4e4e7;
      font-weight: 500;
    }
    .total td {
      padding-top: 16px;
      font-weight: 600;
      border-top: 1px solid #27272a;
    }
    .total .value {
      font-size: 18px;
      color: #a78bfa;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #27272a;
      font-size: 12px;
      color: #52525b;
      text-align: center;
    }
    .paid-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }
    .paid-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thor</h1>
      <h2>Factura de Comisión</h2>
    </div>
    <div class="ref">Ref: ${params.referencia}</div>

    <table>
      <tr>
        <td class="label">Organizador</td>
        <td class="value">${params.nombreOrganizador}</td>
      </tr>
      <tr>
        <td class="label">Sorteo</td>
        <td class="value">${params.tituloSorteo}</td>
      </tr>
      <tr>
        <td class="label">Bonos vendidos</td>
        <td class="value">${params.totalBonosVendidos}</td>
      </tr>
      <tr>
        <td class="label">Total recaudado</td>
        <td class="value">$ ${Number(params.totalRecaudado).toLocaleString("es-CO")}</td>
      </tr>
      <tr>
        <td class="label">Comisión Thor</td>
        <td class="value">${params.comisionPct}%</td>
      </tr>
      <tr class="total">
        <td class="label">Monto a pagar</td>
        <td class="value">$ ${Number(params.montoComision).toLocaleString("es-CO")}</td>
      </tr>
    </table>

    <div class="footer">
      <p>Fecha de emisión: ${params.fechaEmision}</p>
      <p>Sorteo: ${params.fechaSorteo}</p>
      <p style="margin-top: 12px;">
        Realiza el pago desde el panel de control en thor.app/dashboard/cuentas-cobro
      </p>
    </div>
  </div>
</body>
</html>`
}
