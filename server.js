
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

app.get('/subirImagen', (req, res) => {
  const collectionRef = db.collection('perros');
  // Obtén el número total de documentos en la colección
  collectionRef.get()
    .then((querySnapshot) => {
      let numberOfDocuments = querySnapshot.size;
      console.log('Número total de documentos:', numberOfDocuments );
      numberOfDocuments = numberOfDocuments+1;
      console.log('  el id del nuevo sera'+numberOfDocuments);

    })
    .catch((error) => {
      console.error('Error al obtener la colección para obtener su ID:', error);
  });
  res.send('listo');

  
    
});

async function getId(coleccion) {

  const collectionRef = await db.collection(coleccion);
  var numberOfDocuments;


  await collectionRef.get()
    .then((querySnapshot) => {
      let numberOfDocuments = querySnapshot.size;
      numberOfDocuments = numberOfDocuments+1;

    })
    .catch((error) => {
      console.error('Error al obtener la colección para obtener su ID:', error);
  });

  return numberOfDocuments;
}

app.post('/SubirMascota', (req, res) => {
  // Aquí puedes acceder a los parámetros enviados en la solicitud
  const nombre =  req.body.nombre;
  //const imageData = req.file; // Aquí obtienes la imagen
  const edad = req.body.edad;
  const raza = req.body.raza;
  const imagen = req.body.imagen;
  const fechaIngreso = req.body.fecha;
  const tipoMascota = req.body.tipoMascota;
  const destinoMascota = req.body.destinoMascota;
  var  coleccionDatos;
  var data2;

    console.log('tipo mascota  es   ', tipoMascota);
    console.log('destino mascota  es   ', destinoMascota);

  

  const numberOfDocuments = getId(tipoMascota);

  switch(tipoMascota){
    case 'gatos':
      if(destinoMascota=='adoptar'){
        coleccionDatos='gatosAdopcion'
        data2 = {
          'idGato': numberOfDocuments,
          'fechaIngreso': fechaIngreso
      
        };
      }else{
        coleccionDatos='gatosPerdidos'
        data2 = {
          'idGato': numberOfDocuments,
          'fechaPerdido': fechaIngreso
      
        };
      }
      
    break;
    case 'perros':
      if(destinoMascota=='adoptar'){
        coleccionDatos='perrosAdopcion'
        data2 = {
          'idPerro': numberOfDocuments,
          'fechaIngreso': fechaIngreso
      
        };
      }else{
        coleccionDatos='perrosPerdidos'
        data2 = {
          'idPerro': numberOfDocuments,
          'fechaPerdido': fechaIngreso
      
        };
      }
    break;
  }
  console.log('coleccion datos es   ', coleccionDatos);
    console.log('cantidad de documentos es   ', numberOfDocuments);

  const collectionRef1 = db.collection(tipoMascota);
  const collectionRef2 = db.collection(coleccionDatos);

  //Subimos los datos a la coleccion 
  const data = {
    'nombre': nombre,
    'edad': edad,
    'raza': raza,
    'imagen': imagen,
    'id': numberOfDocuments,
  };

  collectionRef1.add(data)
    .then((docRef) => {
      console.log('Documento agregado con ID:', numberOfDocuments);
    })
    .catch((error) => {
      console.error('Error al agregar documento :', error);
    });
    res.send('agregado correctamanete');

  //Subimos los datos a la coleccion perrosAdopcion
  

  collectionRef2.add(data2)
    .then((docRef) => {
      console.log('Documento agregado con ID:', numberOfDocuments);
    })
    .catch((error) => {
      console.error('Error al agregar documento :', error);
    });
    res.send('mascota ingresado correctamente');
});

//-------------- verGatosVerTodos
app.get('/verGatosVerTodos', async (req, res) => {
  try {
    const datos = [];
    const snapshot = await db.collection('gatos').get();
    snapshot.forEach((doc) => {
      datos.push(doc.data());
    });
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos ver todos los gatos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos. ver todos los gatos' });
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


//-------------- VerPerrosVerTodos
app.get('/VerPerrosVerTodos', async (req, res) => {
  try {
    const datos = [];
    const snapshot = await db.collection('perros').get();
    snapshot.forEach((doc) => {
      datos.push(doc.data());
    });
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos ver todos los perros:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos. ver todos los perros' });
  }

});


//---------- VerPerrosEnAdopcion

app.get('/VerPerrosEnAdopcion', async (req, res) => {
  try {
    const datosPerrosAdopcion = [];
    const datosPerros = [];
    const datosPerrosResultado = [];

    const snapshot1 = await db.collection('perrosAdopcion').get();
    const snapshot2 = await db.collection('perros').get();

    snapshot1.forEach((doc) => {
      datosPerrosAdopcion.push(doc.data());

    });
    snapshot2.forEach((doc) => {
      datosPerros.push(doc.data());

    });

    datosPerros.forEach(async (docPerros) =>  {

      datosPerrosAdopcion.forEach(async (docPerrosAdopcion) => {
        if(docPerros.id==docPerrosAdopcion.idPerro){
          var fechaIngresoPerro = docPerrosAdopcion.fechaIngreso;
          fechaIngresoPerro = new Date(fechaIngresoPerro._seconds * 1000 + fechaIngresoPerro._nanoseconds / 1000000);
          const año = fechaIngresoPerro.getFullYear();
          const mes = String(fechaIngresoPerro.getMonth() + 1).padStart(2, '0'); 
          const dia = String(fechaIngresoPerro.getDate()).padStart(2, '0');
          const fecha = `${año}-${mes}-${dia}`;
          docPerros.fecha = fecha;

          datosPerrosResultado.push(docPerros);
        }
      });
    
    });

    res.json(datosPerrosResultado);
  } catch (error) {
    console.error('Error al obtener datos perros adopcion:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos perros adopcion.' });
  }

});


//---------- VerPerrosVerPerdidos

app.get('/VerPerrosVerPerdidos', async (req, res) => {
  try {
    const datosPerrosPerdidos = [];
    const datosPerros = [];
    const datosPerrosResultado = [];

    const snapshot1 = await db.collection('perrosPerdidos').get();
    const snapshot2 = await db.collection('perros').get();

    snapshot1.forEach((doc) => {
      datosPerrosPerdidos.push(doc.data());

    });
    snapshot2.forEach((doc) => {
      datosPerros.push(doc.data());

    });

    datosPerros.forEach(async (docPerros) =>  {

      datosPerrosPerdidos.forEach(async (docPerrosPerdidos) => {
        if(docPerros.id==docPerrosPerdidos.idPerro){
          var fechaPerdidoPerro = docPerrosPerdidos.fechaPerdido;
          fechaPerdidoPerro = new Date(fechaPerdidoPerro._seconds * 1000 + fechaPerdidoPerro._nanoseconds / 1000000);
          const año = fechaPerdidoPerro.getFullYear();
          const mes = String(fechaPerdidoPerro.getMonth() + 1).padStart(2, '0'); 
          const dia = String(fechaPerdidoPerro.getDate()).padStart(2, '0');
          const fecha = `${año}-${mes}-${dia}`;
          docPerros.fecha = fecha;

          datosPerrosResultado.push(docPerros);
        }
      });
    
    });

    res.json(datosPerrosResultado);
  } catch (error) {
    console.error('Error al obtener datos perros perdidos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos perros perdidos.' });
  }

});


