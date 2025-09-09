export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const key = url.pathname.slice(1);
    const method = request.method;
    const origin = "*";

    try {
      if (method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (method === "GET" && path.startsWith("/getCarById")) {
        const carId = url.searchParams.get("id");

        if (!carId) {
          return new Response(JSON.stringify({ error: "id is required" }), {
            status: 400,
          });
        }

        const result = await env.DB.prepare(
          "SELECT * FROM HW_CARS WHERE car_id = ?"
        )
          .bind(carId)
          .all();

        if (result.results.length === 0) {
          return new Response(JSON.stringify({ error: "Car not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Methods": "GET",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          });
        }

        return new Response(JSON.stringify(result.results[0]), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (method === "GET" && path === "/getAllCars") {
        const result = await env.DB.prepare(
          "SELECT car_id, car_name, car_color, car_photo, car_treasure, car_creation_date FROM HW_CARS ORDER BY car_id ASC"
        ).all();

        return new Response(JSON.stringify(result.results), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (method === "POST" && path === "/postNewCar") {
        const body = await request.json();

        const { car_id, car_name, car_color, car_treasure, car_photo } = body;

        if (!car_id || !car_name || !car_color || !car_treasure || !car_photo) {
          return new Response(
            JSON.stringify({ error: "Missing car basic data" }),
            { status: 400 }
          );
        }

        await env.DB.prepare(
          "INSERT INTO HW_CARS (car_id, car_name, car_color, car_treasure, car_photo, car_creation_date ) VALUES (?, ?, ?, ?, ?, datetime(current_timestamp, 'localtime'))"
        )
          .bind(car_id, car_name, car_color, car_treasure, car_photo)
          .run();

        return new Response(
          JSON.stringify({ message: "Car inserted successfully" }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Methods": "POST",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          }
        );
      }

      if (method === "PUT" && path.startsWith("/cars")) {
        await env.PHOTOS.put(key, request.body, {
          onlyIf: request.headers,
          httpMetadata: request.headers,
        });
        return new Response(JSON.stringify({ path: key }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "PUT",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (method === "GET" && path.startsWith("/getCarPhoto")) {
        const photoUrl = url.searchParams.get("url");

        if (!photoUrl) {
          return new Response("Missing 'url' parameter", { status: 400 });
        }

        const object = await env.PHOTOS.get(photoUrl);

        if (object === null) {
          return new Response("Object Not Found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);

        return new Response("body" in object ? object.body : undefined, {
          status: "body" in object ? 200 : 412,
          headers,
        });
      }

      return new Response("Not found", { status: 404 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
      });
    }
  },
};
