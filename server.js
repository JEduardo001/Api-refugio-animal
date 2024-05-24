
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
//const db = require('./dbFirestore'); // Importa la conexión a la base de datos
const admin = require('firebase-admin');
var serviceAccount = require("./refugio-animal-92181-firebase-adminsdk-h8a3q-d18c72f487.json");
// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json());
//firestorage
//const multer = require('multer');
//const { Storage } = require('@google-cloud/storage');



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
//const upload = multer({ dest: 'uploads/' });
// Crea una instancia de Storage de Google Cloud
//const storage = new Storage();
// Obtiene una referencia al bucket de Firebase Storage
//const bucket = storage.bucket(admin.storage().bucket().name);


// Ruta de ejemplo
/*app.get('/mensaje', (req, res) => {
    res.send('¡Hola, mundo desde Express!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Ruta para obtener todos los usuarios
app.get('/gatos', (req, res) => {
    db.query('SELECT * FROM gatos', (err, results) => {
      if (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
      } else {
        //res.send('TODO BIEN');
        res.json(results);
      }
    });
});*/


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


// endpoint de firestore 

app.get('/datos', async (req, res) => {
  try {
    const datos = [];
    const snapshot = await db.collection('1').get();
    snapshot.forEach((doc) => {
      datos.push(doc.data());
    });
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos.' });
  }
});


app.get('/verGatos', async (req, res) => {
  try {
    const datos = [];
    const snapshot = await db.collection('gatos').get();
    snapshot.forEach((doc) => {
      datos.push(doc.data());
    });
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos.' });
  }

});

app.post('/subirImagen', (req, res) => {
  // Aquí puedes acceder a los parámetros enviados en la solicitud
  const nombre =  req.body.nombre;
  //const imageData = req.file; // Aquí obtienes la imagen
  const edad = req.body.edad;
  const raza = req.body.raza;
  const imagen = req.body.imagen;
  
  const numberOfDocuments = null;
  const collectionRef = db.collection('gatos');
  // Obtén el número total de documentos en la colección
  /*collectionRef.get()
    .then((querySnapshot) => {
      numberOfDocuments = querySnapshot.size;
      console.log('Número total de documentos:', numberOfDocuments);
      numberOfDocuments+1;
    })
    .catch((error) => {
      console.error('Error al obtener la colección para obtener su ID:', error);
  });*/

  // Sube datos a Firestore
  const data = {
    'nombre': nombre,
    'edad': edad,
    'raza': raza,
    'imagen': imagen,
    'id': 2
  };

  collectionRef.add(data)
    .then((docRef) => {
      console.log('Documento agregado con ID:', 1);
    })
    .catch((error) => {
      console.error('Error al agregar documento:', error);
    });
    // Envía una respuesta al cliente
    res.send('Imagen recibida correctamente');
});

//-------------- verGatosTodos
app.get('/verGatosVerTodos', async (req, res) => {
  try {
    const datos = [];
    const snapshot = await db.collection('gatos').get();
    snapshot.forEach((doc) => {
      datos.push(doc.data());
    });
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos para ver todos los gatos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos para ver todos los gatos.' });
  }

});


//---------- VerGatosEnAdopcion

app.get('/VerGatosEnAdopcion', async (req, res) => {
  try {
    const datosGatosAdopcion = [];
    const datosGatos = [];
    const datosGatosResultado = [];

    const snapshot1 = await db.collection('gatosAdopcion').get();
    const snapshot2 = await db.collection('gatos').get();

    snapshot1.forEach((doc) => {
      datosGatosAdopcion.push(doc.data());

    });
    snapshot2.forEach((doc) => {
      datosGatos.push(doc.data());

    });

    datosGatos.forEach(async (docGatos) =>  {

      datosGatosAdopcion.forEach(async (docGatosAdopcion) => {
        if(docGatos.id==docGatosAdopcion.idGato){
          var fechaIngresoGato = docGatosAdopcion.fechaIngreso;
          fechaIngresoGato = new Date(fechaIngresoGato._seconds * 1000 + fechaIngresoGato._nanoseconds / 1000000);
          const año = fechaIngresoGato.getFullYear();
          const mes = String(fechaIngresoGato.getMonth() + 1).padStart(2, '0'); 
          const dia = String(fechaIngresoGato.getDate()).padStart(2, '0');
          const fecha = `${año}-${mes}-${dia}`;
          docGatos.fecha = fecha;

          datosGatosResultado.push(docGatos);
        }
      });
    
    });

    res.json(datosGatosResultado);
  } catch (error) {
    console.error('Error al obtener datos gatos adopcion:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos gatos adopcion.' });
  }

});


//---------- VerGatosVerPerdidos

app.get('/VerGatosVerPerdidos', async (req, res) => {
  try {
    const datosGatosPerdidos = [];
    const datosGatos = [];
    const datosGatosResultado = [];

    const snapshot1 = await db.collection('gatosPerdidos').get();
    const snapshot2 = await db.collection('gatos').get();

    snapshot1.forEach((doc) => {
      datosGatosPerdidos.push(doc.data());

    });
    snapshot2.forEach((doc) => {
      datosGatos.push(doc.data());

    });

    datosGatos.forEach(async (docGatos) =>  {

      datosGatosPerdidos.forEach(async (docGatosPerdidos) => {
        if(docGatos.id==docGatosPerdidos.idGato){
          var fechaPerdidoGato = docGatosPerdidos.fechaPerdido;
          fechaPerdidoGato = new Date(fechaPerdidoGato._seconds * 1000 + fechaPerdidoGato._nanoseconds / 1000000);
          const año = fechaPerdidoGato.getFullYear();
          const mes = String(fechaPerdidoGato.getMonth() + 1).padStart(2, '0'); 
          const dia = String(fechaPerdidoGato.getDate()).padStart(2, '0');
          const fecha = `${año}-${mes}-${dia}`;
          docGatos.fecha = fecha;

          datosGatosResultado.push(docGatos);
        }
      });
    
    });

    res.json(datosGatosResultado);
  } catch (error) {
    console.error('Error al obtener datos gatos perdidos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos gatos perdidos.' });
  }

});

/*app.get('/test', async (req, res) => {
  
  const collectionRef = db.collection('gatos');

 
});*/

//subir la imagen a fire storage
/*app.post('/subirImagen', upload.single('image'), async (req, res) => {
  try {
    // Verifica si se subió un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Guarda el archivo en Firebase Storage
    const file = req.file;
    const nombre = req.body.nombre;
    const raza = req.body.raza;
    const edad = req.body.edad;

    const blob = bucket.file(file.originalname);

    // Crea un stream de escritura para cargar el archivo
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    // Maneja los eventos del stream
    blobStream.on('error', err => {
      console.error('Error al cargar el archivo:', err);
      res.status(500).json({ error: 'Error al cargar el archivo' });
    });


    querySnapshot = await FirebaseFirestore.instance.collection('gatos').get();
    var cantidadGatos = querySnapshot.size;
    cantidadGatos++;
  
    blobStream.on('finish', async () => {
      // Una vez que la carga del archivo se ha completado, genera la URL de descarga
      const imageUrl = await blob.getSignedUrl({ action: 'read', expires: '01-01-2100' });
      
      // Guarda la URL en Firestore u otra base de datos si es necesario
      await firestore.collection('gatos').add({ 
          'edad': edad,
          'id': cantidadGatos,
          'imagen': imageUrl,
          'nombre': nombre,
          'raza': raza

        }
      );

      // Responde con la URL de la imagen
      res.json({ imageUrl });
    });

    // Escribe el archivo en el stream
    blobStream.end(file.buffer);
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});*/
