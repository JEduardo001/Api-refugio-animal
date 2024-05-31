
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
  let numberOfDocuments;


  await collectionRef.get()
    .then((querySnapshot) => {
      numberOfDocuments = querySnapshot.size;
      numberOfDocuments = numberOfDocuments+1;

    })
    .catch((error) => {
      console.error('Error al obtener la colección para obtener su ID:', error);
  });

  return numberOfDocuments;
}

app.post('/SubirReporteRescateMascota', async (req, res) => {
  const nombreTutor =  req.body.nombreTutor;
  const direccion = req.body.direccion;
  const telefono = req.body.telefono;
  const correoElectronico = req.body.correoElectronico;
  const idMascota = req.body.idMascota;
  const tipoMascota = req.body.tipoMascota;
  const ubicacionMascota = req.body.ubicacionMascota;

  const idMascota = Number(idMascota);
  const collectionRef = db.collection('reporteMascotasRescatadas');

  const data = {
    'nombreTutor': nombreTutor,
    'direccion': direccion,
    'telefono': telefono,
    'idMascota': idMascota,
    'correoElectronico': correoElectronico,
    'tipoMascota': tipoMascota,
    'ubicacionMascota': ubicacionMascota
  };

  

  collectionRef.add(data)
    .then((docRef) => {
      console.log('Documento agregado con ID:', numberOfDocuments);
    })
    .catch((error) => {
      console.error('Error al agregar documento :', error);
    });
    res.send('agregado correctamanete');

});

app.get('/getRescates', async (req, res) => {
  try {
    const datosFinales = [];
    const snapshot = await db.collection('reporteMascotasRescatadas').get();

    for (const doc of snapshot.docs) {
      const docData = doc.data();
      const idMascota = Number(docData.idMascota);
      const tipoMascota = docData.tipoMascota;

      const collectionRef = db.collection(tipoMascota + 's');
      const querySnapshot = await collectionRef.where('id', '==', idMascota).get();

      querySnapshot.forEach((doc2) => {
        const combinedData = {
          ...docData,
          ...doc2.data()
        };
        datosFinales.push(combinedData);
      });
    }

    res.json(datosFinales);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos.' });
  }
});

app.delete('/rescatarMascota', async (req, res) => {
  const idMascota = req.body.idMascota;
  const tipoMascota = req.body.tipoMascota;
  const ubicacionMascota = req.body.ubicacionMascota;

  const idNumber = Number(idMascota);
  var campoIdMascota;

  if (ubicacionMascota === 'gatosAdopcion' || ubicacionMascota === 'gatosPerdidos') {
    campoIdMascota = 'idGato';
  } else {
    campoIdMascota = 'idPerro';
  }

  try {
    const collectionRef = db.collection(tipoMascota + 's');
    const querySnapshot = await collectionRef.where('id', '==', idNumber).get();

   

    querySnapshot.forEach(async (doc) => {
      await doc.ref.delete();
    });

    const collectionRef2 = db.collection(ubicacionMascota);
    const querySnapshot2 = await collectionRef2.where(campoIdMascota, '==', idNumber).get();


    querySnapshot2.forEach(async (doc) => {
      await doc.ref.delete();
    });

    const collectionRef3 = db.collection('reporteMascotasRescatadas');
    const querySnapshot3 = await collectionRef3.where('idMascota', '==', idNumber).get();


    querySnapshot3.forEach(async (doc) => {
      await doc.ref.delete();
    });

    res.status(200).send(`TODO BIEN`);
  } catch (error) {
    console.error('Error al eliminar el documento:', error);
    res.status(500).send('Error al eliminar el documento');
  }
});

app.delete('/BorrarMascota', async (req, res) => {
  const id = req.body.id;
  const tipoMascota = req.body.tipoMascota;
  const ubicacion = req.body.ubicacion;
  let idMascota;

  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    return res.status(400).send('ID del documento no es válido');
  }

  if (ubicacion === 'gatosAdopcion' || ubicacion === 'gatosPerdidos') {
    idMascota = 'idGato';
  } else {
    idMascota = 'idPerro';
  }

  try {
    // Eliminar en la colección de tipoMascota
    const collectionRef = db.collection(tipoMascota + 's');
    const querySnapshot = await collectionRef.where('id', '==', idNumber).get();

    if (querySnapshot.empty) {
      return res.status(404).send(`No se encontró una mascota con ID ${id} en la colección ${tipoMascota + 's'}.`);
    }

    querySnapshot.forEach(async (doc) => {
      await doc.ref.delete();
    });

    // Eliminar en la colección de ubicación
    const collectionRef2 = db.collection(ubicacion);
    const querySnapshot2 = await collectionRef2.where(idMascota, '==', idNumber).get();

    if (querySnapshot2.empty) {
      return res.status(404).send(`No se encontró una mascota con ID ${id} en la colección ${ubicacion}.`);
    }

    querySnapshot2.forEach(async (doc) => {
      await doc.ref.delete();
    });

    res.status(200).send(`Mascota con ID ${id} eliminada correctamente de ${tipoMascota + 's'} y ${ubicacion}.`);
  } catch (error) {
    console.error('Error al eliminar el documento:', error);
    res.status(500).send('Error al eliminar el documento');
  }
});

app.post('/ActualizarMascota', async (req, res) => {
  const nombre =  req.body.nombre;
  const edad = req.body.edad;
  const raza = req.body.raza;
  const imagen = req.body.imagen;
  const fecha = req.body.fecha;
  const tipoMascota = req.body.tipoMascota;
  const ubicacionMascota = req.body.ubicacion;
  const id = req.body.id;

  var idMascota;

  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    return res.status(400).send('ID del documento no es válido');
  }

  var coleccionDB;

  var datos1 = {};
  var datos2 = {};

  if (nombre !== undefined) datos1.nombre = nombre;
  if (edad !== undefined) datos1.edad = edad;
  if (raza !== undefined) datos1.raza = raza;
  if (imagen !== undefined) datos1.imagen = imagen;



  if(tipoMascota=='gato'){
    coleccionDB = 'gatos';
  }else{
    coleccionDB = 'perros';
  }
  switch(ubicacionMascota){
    case 'gatosAdopcion':
      datos2.fechaIngreso = fecha;
      idMascota='idGato';
    break;
    case 'gatosPerdidos':
      datos2.fechaPerdido = fecha;
      idMascota='idGato';
    break;
    case 'perrosAdopcion':
      datos2.fechaIngreso = fecha;
      idMascota='idPerro';
    break;
    case 'perrosPerdidos':
      datos2.fechaPerdido = fecha;
      idMascota='idPerro';
    break;
  }


  try {
    console.log('Datos a actualizar:', datos1);
    console.log('Colección:', coleccionDB, 'ID:', id);

    const collectionRef = db.collection(coleccionDB);
    const querySnapshot = await collectionRef.where('id', '==', idNumber).get();
    const docRef = querySnapshot.docs[0].ref;

    const collectionRef2 = db.collection(ubicacionMascota);
    const querySnapshot2 = await collectionRef2.where(idMascota, '==', idNumber).get();
    const docRef2 = querySnapshot2.docs[0].ref;

    await docRef.update(datos1);
    await docRef2.update(datos2);
    res.status(200).send('Documento actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar el documento:', error);
    res.status(500).send('Error al actualizar el documento');
  }

  
 
});

app.post('/SubirMascota', async (req, res) => {
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
  var especie;
  var data2;

    console.log('tipo mascota  es   ', tipoMascota);
    console.log('destino mascota  es   ', destinoMascota);

  

  const numberOfDocuments = await getId(tipoMascota);

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
      especie='gato';

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
      especie='perro';

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
    'ubicacion': coleccionDatos,
    'especie': especie
  };

  collectionRef1.add(data)
    .then((docRef) => {
      console.log('Documento agregado con ID:', numberOfDocuments);
    })
    .catch((error) => {
      console.error('Error al agregar documento :', error);
    });
    res.send('agregado correctamanete');

  

  collectionRef2.add(data2)
    .then((docRef) => {
      console.log('Documento agregado con ID:', numberOfDocuments);
    })
    .catch((error) => {
      console.error('Error al agregar documento :', error);
    });
    
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
          
          docGatos.fecha = fechaIngresoGato;
        
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
        
          docGatos.fecha = fechaPerdidoGato;

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
          
          docPerros.fecha = fechaIngresoPerro;

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
        
          docPerros.fecha = fechaPerdidoPerro;

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



