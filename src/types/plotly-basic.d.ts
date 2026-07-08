/**
 * Typen-Brücke: `plotly.js-basic-dist-min` hat keine eigenen Typen, liefert
 * aber dieselbe API wie `plotly.js` (Typen aus @types/plotly.js) — nur als
 * abgespecktes Bundle (u.a. scatter/bar, genau was wir brauchen).
 */
declare module "plotly.js-basic-dist-min" {
  import * as Plotly from "plotly.js";
  export = Plotly;
}
