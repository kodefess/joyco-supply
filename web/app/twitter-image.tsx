import OpengraphImage from "./opengraph-image";

export { alt, size, contentType } from "./opengraph-image";
// Konfigurasi segmen tidak boleh di-reexport, jadi ditulis ulang.
export const revalidate = 300;

export default OpengraphImage;
