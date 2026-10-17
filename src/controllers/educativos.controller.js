import { contenidosEducativosPrueba } from "../dataTest/educativosTest.js";

//---------------------------------------------------------------------------------------------------//
//no mucha ciencia en este, total es contenido educativo de "extra"
// funciones auxiliares //

function esObjetoJson(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

function obtenerIdValido(idParametro) {
  const id = Number(idParametro);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function obtenerSiguienteId() {
  return contenidosEducativosPrueba.reduce(
    (mayorId, contenido) => Math.max(mayorId, contenido.id),
    0
  ) + 1;
}

function validarContenido(body, { alCrear = false } = {}) {
  const camposPermitidos = alCrear
    ? ["titulo", "categoria", "contenido", "usuario_id"]
    : ["titulo", "categoria", "contenido"];

  const camposDesconocidos = Object.keys(body).filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposDesconocidos.length > 0) {
    return {
      error: {
        message: "Hay campos que no se permiten en esta operación",
        fields: camposDesconocidos,
      },
    };
  }

  const datos = {};
  const camposInvalidos = [];

  const limites = {
    titulo: 150,
    categoria: 100,
  };

  for (const campo of ["titulo", "categoria", "contenido"]) {
    if (body[campo] === undefined) {
      if (alCrear) camposInvalidos.push(campo);
      continue;
    }

    if (
      typeof body[campo] !== "string" ||
      body[campo].trim().length === 0
    ) {
      camposInvalidos.push(campo);
      continue;
    }

    const valor = body[campo].trim();

    if (limites[campo] && valor.length > limites[campo]) {
      camposInvalidos.push(campo);
      continue;
    }

    datos[campo] = valor;
  }

  if (alCrear) {
    if (!Number.isInteger(body.usuario_id) || body.usuario_id <= 0) {
      camposInvalidos.push("usuario_id");
    } else {
      datos.usuario_id = body.usuario_id;
    }
  }

  if (camposInvalidos.length > 0) {
    return {
      error: {
        message: "Hay campos obligatorios o con un formato inválido",
        fields: [...new Set(camposInvalidos)],
      },
    };
  }

  return { datos };
}

//---------------------------------------------------------------------------------------------------//
// parte para POST de contenidos educativos //

export const crearContenidoEducativo = (req, res) => {
  const body = req.body;

  if (!esObjetoJson(body)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El cuerpo debe ser un objeto JSON",
      },
    });
  }

  const { datos, error } = validarContenido(body, {
    alCrear: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }

  const nuevoContenido = {
    id: obtenerSiguienteId(),
    ...datos,
    creado_en: new Date().toISOString(),
  };

  contenidosEducativosPrueba.push(nuevoContenido);

  return res.status(201).json({
    success: true,
    message: "Contenido educativo creado correctamente",
    data: nuevoContenido,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para GET de contenidos educativos //

export const getContenidosEducativos = (req, res) => {
  const { categoria, usuario_id } = req.query;
  let usuarioIdBuscado;

  if (usuario_id !== undefined) {
    usuarioIdBuscado = obtenerIdValido(usuario_id);

    if (usuarioIdBuscado === null) {
      return res.status(400).json({
        success: false,
        error: {
          message: "usuario_id debe ser un número entero positivo",
        },
      });
    }
  }

  const resultado = contenidosEducativosPrueba.filter((item) => {
    return (
      (categoria === undefined ||
        item.categoria.toLowerCase() === categoria.toLowerCase()) &&
      (usuarioIdBuscado === undefined ||
        item.usuario_id === usuarioIdBuscado)
    );
  });

  return res.status(200).json({
    success: true,
    message: "Contenidos educativos obtenidos correctamente",
    data: resultado,
  });
};

export const getContenidoEducativoPorId = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const contenido = contenidosEducativosPrueba.find(
    (item) => item.id === id
  );

  if (!contenido) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Contenido educativo no encontrado",
      },
    });
  }

  return res.status(200).json({
    success: true,
    message: "Contenido educativo obtenido correctamente",
    data: contenido,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para PATCH de contenidos educativos //

export const actualizarContenidoEducativo = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const contenido = contenidosEducativosPrueba.find(
    (item) => item.id === id
  );

  if (!contenido) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Contenido educativo no encontrado",
      },
    });
  }

  const body = req.body;

  if (!esObjetoJson(body)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El cuerpo debe ser un objeto JSON",
      },
    });
  }

  if (Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Debes enviar al menos un campo para actualizar",
      },
    });
  }

  const { datos, error } = validarContenido(body);

  if (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }

  Object.assign(contenido, datos);

  return res.status(200).json({
    success: true,
    message: "Contenido educativo actualizado correctamente",
    data: contenido,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para DELETE de contenidos educativos //

export const eliminarContenidoEducativo = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const indice = contenidosEducativosPrueba.findIndex(
    (item) => item.id === id
  );

  if (indice === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Contenido educativo no encontrado",
      },
    });
  }

  const [contenidoEliminado] =
    contenidosEducativosPrueba.splice(indice, 1);

  return res.status(200).json({
    success: true,
    message: "Contenido educativo eliminado correctamente",
    data: contenidoEliminado,
  });
};

//---------------------------------------------------------------------------------------------------//