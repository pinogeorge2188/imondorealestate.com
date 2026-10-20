/* ════════════════════════════════════════════════════════════════
   IMONDO — centrele zonelor, pentru harta de REZERVĂ de pe pagina proprietății.
   Se folosesc DOAR când proprietatea nu are pin (coordonate) sau e „locație discretă”:
   atunci harta arată un cerc de 450 m în jurul centrului zonei, nu poziția proprietății.
   Fără pin și fără zonă în lista de mai jos → harta nu apare deloc.

   COORDONATELE SUNT PROPUSE, NEVERIFICATE PE TEREN (14.10.2026). Cele marcate „folosită azi” se verifică primele.
   Corectare pe GitHub: înlocuiești cele două numere de pe rândul zonei (lat, lng), din Google Maps
   (click dreapta pe punct → primul rând). Mai multe nume pentru aceeași zonă: separate cu „ / ”.
   ════════════════════════════════════════════════════════════════ */
window.IMONDO_ZONE_CENTRE = [
  ['Floreasca', 44.4655, 26.1000],   // ← folosită azi: DE VERIFICAT
  ['Primaverii', 44.4690, 26.0850],   // ← folosită azi: DE VERIFICAT
  ['Dorobanti', 44.4600, 26.0920],
  ['P-ta Dorobanti', 44.4553, 26.0973],
  ['Capitale', 44.4590, 26.1000],
  ['Beller', 44.4553, 26.1030],
  ['Televiziune', 44.4618, 26.0960],
  ['Aviatorilor', 44.4626, 26.0839],
  ['Kiseleff', 44.4610, 26.0780],   // ← folosită azi: DE VERIFICAT
  ['Arcul de Triumf', 44.4673, 26.0782],
  ['Herastrau', 44.4720, 26.0820],
  ['Soseaua Nordului / Nordului', 44.4790, 26.0900],
  ['Aviatiei', 44.4800, 26.1050],   // ← folosită azi: DE VERIFICAT
  ['Barbu Vacarescu', 44.4710, 26.1090],
  ['Pipera', 44.4950, 26.1200],   // ← folosită azi: DE VERIFICAT
  ['Iancu Nicolae', 44.5130, 26.1050],
  ['Baneasa', 44.4950, 26.0830],   // ← folosită azi: DE VERIFICAT
  ['Domenii', 44.4640, 26.0600],
  ['Casin', 44.4586, 26.0692],
  ['1 Mai', 44.4636, 26.0645],
  ['Clucerului', 44.4610, 26.0690],
  ['P-ta Presei Libere', 44.4790, 26.0730],
  ['P-ta Victoriei / Victoriei', 44.4520, 26.0860],   // ← folosită azi: DE VERIFICAT
  ['Lahovari', 44.4480, 26.0950],
  ['Romana / P-ta Romana', 44.4465, 26.0975],
  ['Eminescu', 44.4480, 26.1010],
  ['Dacia', 44.4490, 26.0985],
  ['Amzei / P-ta Amzei', 44.4440, 26.0925],
  ['Calea Victoriei', 44.4420, 26.0950],
  ['Magheru', 44.4435, 26.0985],
  ['Gradina Icoanei', 44.4455, 26.1035],
  ['Polona', 44.4490, 26.1065],   // ← folosită azi: DE VERIFICAT
  ['Batistei', 44.4395, 26.1035],
  ['Armeneasca', 44.4405, 26.1085],
  ['Rosetti / P-ta Rosetti', 44.4375, 26.1070],
  ['Universitate / P-ta Universitatii', 44.4355, 26.1015],
  ['Centrul Istoric / Lipscani', 44.4315, 26.1010],
  ['Cismigiu', 44.4375, 26.0905],
  ['Stirbei Voda', 44.4400, 26.0850],
  ['Kogalniceanu', 44.4350, 26.0880],
  ['Cotroceni', 44.4330, 26.0660],   // ← folosită azi: DE VERIFICAT
  ['Unirii / P-ta Unirii', 44.4265, 26.1025],
  ['Centrul Civic', 44.4270, 26.0950],
  ['Parcul Carol', 44.4175, 26.0980],
  ['Otopeni', 44.5510, 26.0710],   // ← folosită azi: DE VERIFICAT
  ['Tunari', 44.5480, 26.1400],
];
window.IMONDO_RAZA_ZONA_M = 450;
