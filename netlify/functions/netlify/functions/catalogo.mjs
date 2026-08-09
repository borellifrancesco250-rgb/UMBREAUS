import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

export default async (req) => {
  const user = await getUser();

  if (!user) {
    return new Response("Non autorizzato", { status: 401 });
  }

  if (!user.roles?.includes("admin")) {
    return new Response("Accesso negato", { status: 403 });
  }

  const store = getStore("catalogo-umbreaus");

  if (req.method === "GET") {
    const catalogo = await store.get("prodotti", {
      type: "json",
      consistency: "strong"
    });

    return Response.json(catalogo || []);
  }

  if (req.method === "POST") {
    const dati = await req.json();

    if (!Array.isArray(dati)) {
      return new Response("Formato catalogo non valido", {
        status: 400
      });
    }

    await store.setJSON("prodotti", dati);

    return Response.json({
      success: true,
      message: "Catalogo aggiornato"
    });
  }

  return new Response("Metodo non consentito", {
    status: 405
  });
};
