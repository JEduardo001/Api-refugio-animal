
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const admin = require('firebase-admin');
var serviceAccount = require("./refugio-animal-92181-firebase-adminsdk-h8a3q-d18c72f487.json");
// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const fileUpload = require('express-fileupload');
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } })); 




admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();



app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
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

app.post('/CrearCuentaAdmin', async (req, res) => {
  const nombre =  req.body.nombre;
  const contrasena = req.body.contrasena;
  
  const collectionRef = db.collection('administradores');
  
  let numberOfDocuments;

  await collectionRef.get()
    .then((querySnapshot) => {
      numberOfDocuments = querySnapshot.size;
      numberOfDocuments = numberOfDocuments+1;

    })
    .catch((error) => {
      console.error('Error al obtener la cantidad de la coleccion:', error);
  });


  
  const data = {
    'usuario': nombre,
    'contrasena': contrasena,
    'id': numberOfDocuments

 
  };

  collectionRef.add(data)
    .then((docRef) => {
      console.log('Cuenta ADMIN creada');
    })
    .catch((error) => {
      console.error('Error al crear cuenta ADMIN:', error);
    });
    res.send('Cuenta ADMIN creada');

});

app.post('/CrearCuenta', async (req, res) => {
  const nombre =  req.body.nombre;
  const direccion = req.body.direccion;
  const telefono = req.body.telefono;
  const correoElectronico = req.body.correoElectronico;
  const contrasena = req.body.contrasena;
 


  
  const collectionRef = db.collection('usuarios');
  
  let numberOfDocuments;

  await collectionRef.get()
    .then((querySnapshot) => {
      numberOfDocuments = querySnapshot.size;
      numberOfDocuments = numberOfDocuments+1;

    })
    .catch((error) => {
      console.error('Error al obtener la cantidad de la coleccion:', error);
  });


  
  const data = {
    'nombreUsuario': nombre,
    'direccion': direccion,
    'telefono': telefono,
    'correoElectronico': correoElectronico,
    'contrasena': contrasena,
    'id': numberOfDocuments

 
  };

  collectionRef.add(data)
    .then((docRef) => {
      console.log('Cuenta creada');
    })
    .catch((error) => {
      console.error('Error al crear cuenta:', error);
    });
    res.send('Cuenta creada');

});

app.post('/IniciarSesion', async (req, res) => {
  const nombreUsuario = req.body.nombreUsuario;
  const contrasena = req.body.contrasena;

  var collectionRef = db.collection('usuarios');
  var querySnapshot = await collectionRef.where('nombreUsuario', '==', nombreUsuario).where('contrasena', '==', contrasena).get();
  var tipoUser;
  var existe = false;
  var idUsuario;

  if (querySnapshot.empty) {
    collectionRef = db.collection('administradores');
    querySnapshot = await collectionRef.where('usuario', '==', nombreUsuario).where('contrasena', '==', contrasena).get();
    if (!querySnapshot.empty) {
      tipoUser = 'admin';
      existe = true;
      idUsuario = querySnapshot.docs[0].data().id; 
    }
  } else {
    tipoUser = 'usuario';
    existe = true;
    idUsuario = querySnapshot.docs[0].data().id; 
  }

  const data = {
    'idUsuario': idUsuario,
    'tipo': tipoUser,
    'existeUsuario': existe,
  };

  res.json(data); 
});


app.post('/SubirReporteRescateMascota', async (req, res) => {
  const nombreTutor =  req.body.nombreTutor;
  const direccion = req.body.direccion;
  const telefono = req.body.telefono;
  const correoElectronico = req.body.correoElectronico;
  var idMascota = req.body.idMascota;
  const tipoMascota = req.body.tipoMascota;
  const ubicacionMascota = req.body.ubicacionMascota;

  idMascota = Number(idMascota);
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
      console.log('Reporte agregado :');
    })
    .catch((error) => {
      console.error('Error al agregar reporte :', error);
    });
    res.send('agregado correctamanete reporte');

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
  const signosMaltrato = req.body.signosMaltrato;
  const vacunaLeptospirosis = req.body.vacunaLeptospirosis;
  const vacunaRabia = req.body.vacunaRabia;
  const vacunaCoronavirus = req.body.vacunaCoronavirus;
  const vacunaPeritonitis = req.body.vacunaPeritonitis;
  const vacunaCalcivirus = req.body.vacunaCalcivirus;
  

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
  if (signosMaltrato !== undefined) datos1.signosMaltrato = signosMaltrato;
  if (vacunaLeptospirosis !== undefined) datos1.vacunaLeptospirosis = vacunaLeptospirosis;
  if (vacunaRabia !== undefined) datos1.vacunaRabia = vacunaRabia;
  datos1.vacunaCoronavirus = vacunaCoronavirus;
  datos1.vacunaPeritonitis = vacunaPeritonitis;
  datos1.vacunaCalcivirus = vacunaCalcivirus;




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


app.post('/DesactivarMascota', async (req, res) => {
  const tipoMascota =  req.body.tipoMascota;
  const ubicacionMascota = req.body.ubicacion;
  const valor = req.body.valor;
  const id = req.body.id;

  

  var idMascota;

  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    return res.status(400).send('ID del documento no es válido');
  }

  var coleccionDB={};
  var datos1 = {};

 datos1.adoptado = valor;


  if(tipoMascota=='gato'){
    coleccionDB = 'gatos';
  }else{
    coleccionDB = 'perros';
  }
  switch(ubicacionMascota){
    case 'gatosAdopcion':
      idMascota='idGato';
    break;
    case 'gatosPerdidos':
      idMascota='idGato';
    break;
    case 'perrosAdopcion':
      idMascota='idPerro';
    break;
    case 'perrosPerdidos':
      idMascota='idPerro';
    break;
  }


  try {
    console.log('Datos a actualizar:', datos1);
    console.log('Colección:', coleccionDB, 'ID:', id);

    const collectionRef = db.collection(coleccionDB);
    const querySnapshot = await collectionRef.where('id', '==', idNumber).get();
    const docRef = querySnapshot.docs[0].ref;

    await docRef.update(datos1);
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
  const signosMaltrato = req.body.signosMaltrato;
  const vacunaLeptospirosis = req.body.vacunaLeptospirosis;
  const vacunaRabia = req.body.vacunaRabia;
  const vacunaCoronavirus = req.body.vacunaCoronavirus;
  const vacunaPeritonitis = req.body.vacunaPeritonitis;
  const vacunaCalcivirus = req.body.vacunaCalcivirus;

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
    'especie': especie,
    'signosMaltrato': signosMaltrato,
    'vacunaLeptospirosis': vacunaLeptospirosis,
    'vacunaRabia': vacunaRabia,
    'vacunaCoronavirus': vacunaCoronavirus,
    'vacunaPeritonitis': vacunaPeritonitis,
    'vacunaCalcivirus': vacunaCalcivirus,
    'adoptado': false

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
    const datosFinales = [];
    const snapshot = await db.collection('gatos').get();

    for (const doc of snapshot.docs) {
      const docData = doc.data();
      const idMascota = Number(docData.id);
      const ubicacionGato = docData.ubicacion;

      const collectionRef = db.collection(ubicacionGato);
      const querySnapshot = await collectionRef.where('idGato', '==', idMascota).get();

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



