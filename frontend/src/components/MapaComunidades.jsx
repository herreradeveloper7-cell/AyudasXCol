import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

const CENTRO_TOLIMA = [4.4389, -75.2322];

const iconoComunidad = divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #138c85;
      border: 3px solid white;
      box-shadow: 0 3px 12px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: white;
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

export default function MapaComunidades({ comunidades = [] }) {
  const ubicacionesValidas = comunidades.filter((comunidad) => {
    const lat = Number(comunidad.latitud);
    const lng = Number(comunidad.longitud);

    return (
      comunidad.latitud !== null &&
      comunidad.longitud !== null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div>
          <h3 className="text-lg font-bold text-primary">
            Mapa de comunidades
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Visualización geográfica de registros en el Tolima
          </p>
        </div>

        <span className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
          {ubicacionesValidas.length} ubicaciones
        </span>
      </div>

      <div className="relative z-0 h-[440px] w-full">
        <MapContainer
          center={CENTRO_TOLIMA}
          zoom={9}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {ubicacionesValidas.map((comunidad) => (
            <Marker
              key={comunidad.id_comunidad}
              position={[Number(comunidad.latitud), Number(comunidad.longitud)]}
              icon={iconoComunidad}
            >
              <Popup>
                <div className="min-w-[190px]">
                  <h4 className="mb-2 text-base font-bold text-primary">
                    {comunidad.nombre}
                  </h4>

                  <p className="mb-2 text-sm text-slate-600">
                    📍 {comunidad.municipio}, Tolima
                  </p>

                  <p className="text-sm leading-relaxed text-slate-500">
                    {comunidad.descripcion || "Sin descripción"}
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Comunidad registrada
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-secondary"></span>
        <p className="text-xs text-slate-500">
          Datos simulados para pruebas académicas. Las ubicaciones no
          representan necesidades reales.
        </p>
      </div>
    </div>
  );
}
