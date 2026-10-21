/* ════════════════════════════════════════════════════════════════
   IMONDO — centrele zonelor, pentru harta de REZERVĂ de pe pagina proprietății.
   Se folosesc DOAR când proprietatea nu are pin (coordonate) sau e „locație discretă”:
   atunci harta arată un cerc de 450 m în jurul centrului zonei, nu poziția proprietății.
   Fără pin și fără zonă în lista de mai jos → harta nu apare deloc.

   Lista zonelor IMONDO, cu centrele stabilite de Pino (21.10.2026).
   Corectare pe GitHub: înlocuiești cele două numere de pe rândul zonei (lat, lng), din Google Maps
   (click dreapta pe punct → primul rând). Mai multe nume pentru aceeași zonă: separate cu „ / ”.
   Diacriticele și prefixul „P-ța” nu contează („Victoriei” prinde și „P-ta Victoriei”).
   ════════════════════════════════════════════════════════════════ */
window.IMONDO_ZONE_CENTRE = [
  ['Floreasca',     44.4660, 26.1020],
  ['Herăstrău',     44.4745, 26.0810],
  ['Primăverii',    44.4680, 26.0870],
  ['Dorobanți',     44.4600, 26.0950],
  ['Pipera',        44.4950, 26.1200],
  ['Cotroceni',     44.4335, 26.0660],
  ['Victoriei',     44.4522, 26.0858],
  ['Otopeni',       44.5500, 26.0690],
  ['Iancu Nicolae', 44.5110, 26.1290],
  ['Domenii',       44.4655, 26.0612],
  ['Băneasa',       44.4960, 26.0830],
  ['Polonă',        44.4510, 26.1000],   // păstrată: anunț publicat aici
  // păstrate: folosite de anunțuri publicate (20.10), centre propuse de Claude, NEVERIFICATE
  ['Kiseleff',      44.4610, 26.0780],
  ['Aviației',      44.4800, 26.1050],
];
window.IMONDO_RAZA_ZONA_M = 450;

/* Localități din Ilfov (NU zone ale Bucureștiului): numele zonei → localitatea.
   Pe site: „Otopeni, Ilfov”, „Iancu Nicolae, Voluntari, Ilfov” în locație, linkul Google Maps și schema pentru Google. */
window.IMONDO_ZONE_ILFOV = {
  'Otopeni': 'Otopeni', 'Iancu Nicolae': 'Voluntari', 'Voluntari': 'Voluntari',
  'Tunari': 'Tunari', 'Balotești': 'Balotești', 'Corbeanca': 'Corbeanca',
};
