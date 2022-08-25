const url ='https://s5br3wb0e4.execute-api.us-east-1.amazonaws.com/Prod';

function borrarL() {
    localStorage.removeItem('tipo');
    localStorage.removeItem('id');
    window.location.href='login.html';
  }

const getInfo = async () => {
    const uri = `${url}/psicologos/${localStorage.getItem("id")}`;
    const response = await fetch(uri);
    const result = await response.json();
    return result;
}

const getCitas = async () => {
    const uri = `${url}/citasPorPsicologo/${localStorage.getItem("id")}`;
    const response = await fetch(uri);
    const result = await response.json();
    return result;
}

const getTurnos = async () => {
  const uri = `${url}/turnosDisponibles/${localStorage.getItem("id")}`;
  const response = await fetch(uri);
  const result = await response.json();
  return result;
}

const getNTurnos = async () => {
  const uri = `${url}/turnosTotales/cantidad/${localStorage.getItem("id")}`;
  const response = await fetch(uri);
  const result = await response.json();
  return result;
}

const getNTurnosT = async () => {
  const uri = `${url}/turnosTotales/cantidad`;
  const response = await fetch(uri);
  const result = await response.json();
  return result;
}

const getAtenciones = async (idPaciente) => {
  const uri = `${url}/atenciones/${idPaciente}`;
  const response = await fetch(uri);
  const result = await response.json();
  return result;
}

const showAlertMessage = (message, tipoAlerta) =>{
  const divMessage = document.getElementById('message');
  divMessage.innerHTML =`<div class="alert alert-${tipoAlerta}" role="alert">${message}</div>`;
  setTimeout(()=>{
      divMessage.innerHTML = '';
  },5000);
}

const getFecha = () => {
  const fecha = new Date();
  const dateItems = fecha.toLocaleDateString().split('/');
  return `${dateItems[2]}-${dateItems[1].length < 2? '0'+dateItems[1]:dateItems[1]}-${dateItems[0].length < 2? '0'+dateItems[0]:dateItems[0]}`;
}

const renderCitas = (citas, fecha) => {
  const result = citas.filter(cita => cita.fecha.split('T')[0] == fecha && cita.estado == 'No iniciada');
  result.sort((x, y) =>{
    return ((x.hora < y.hora) ? -1 : ((x.hora > y.hora) ? 1 : 0));
  });
  
  const divPacientes = document.getElementById('lista-pacientes')

  if(result.length > 0){

    let lista = `<div class="btn-group d-flex flex-column" 
                  role="group" aria-label="Basic radio toggle button group">`;

    result.forEach(item => {
      lista += `<input type="radio" class="btn-check cita" name="btnradio" id="cita-${item.id}" 
                autocomplete="off" onclick=renderCitaDetalles(${item.id},${item.idPaciente}) cheked>
                <label class="btn btn-outline-primary" for="cita-${item.id}">
                  ${item.nombreCompleto}
                </label>`
    })
    
    divPacientes.innerHTML = lista + '</div>';

  }else{

    divPacientes.textContent = 'No hay pacientes agendados';

  }
    
}

const renderDatos = (psicologo) => {
  document.getElementById('perfilNombre').textContent = `Nombre: ${psicologo.nombreCompleto}`;
  document.getElementById('perfilCedula').textContent = `Cedula: ${psicologo.cedula}`;
  document.getElementById('perfilMail').textContent = `Email: ${psicologo.email}`;
}

const renderCitaDetalles = async (idCita, idPaciente) => {
  const divDetalles = document.getElementById('detalles-cita');
  const citas = await getCitas();
  const targetCita = citas.find(cita => cita.id == idCita);

  localStorage.setItem('idPaciente', idPaciente);

  divDetalles.innerHTML = `<div class="card text-center">
                            <div class="card-header" id="titulo-cita">
                              Información de la cita
                            </div>
                            <div class="card-body" id="detalles-cita">
                              <h5 class="card-title">Paciente: ${targetCita.nombreCompleto}</h5>
                              <p class="card-text">
                                Fecha: ${targetCita.fecha.split('T')[0]}
                                Hora: ${targetCita.hora}
                              </p>

                              <div id="observacion"></div>
                              
                              <button class="btn btn-primary" id="gestion-cita" onclick=gestionarCita(${targetCita.id})>Iniciar cita</button>
                              <button class="btn btn-secondary" data-bs-toggle="modal" 
                              data-bs-target="#staticBackdrop" 
                              onclick=showHC(${targetCita.idPaciente})>
                              Ver historia clínica
                              </button>
                            </div>
                          </div>`;

}

const disableListaCitas = (value = true) => {
  const elements = document.getElementsByClassName('cita');
  for(let i = 0; i < elements.length; i++){
    elements[i].disabled = value;
  }
}

const gestionarCita = (idCita) => {
  const btnGestion = document.getElementById('gestion-cita');
  btnGestion.textContent == 'Iniciar cita'? iniciarCita(btnGestion) : finalizarCita(idCita);
}

const iniciarCita = (btnGestion) => {
  disableListaCitas();
  document.getElementById('titulo-cita').textContent = 'Cita en proceso';
  document.getElementById('observacion').innerHTML = `<label for="floatingTextarea">Observaciones</label> 
                                                      <textarea class="form-control" id="text-observaciones">`;
  btnGestion.setAttribute('class', 'btn btn-danger');
  btnGestion.textContent = 'Finalizar cita';
}

const finalizarCita = async (idCita) => {
  disableListaCitas(false);

  const atencion = {
    "idPaciente": localStorage.getItem('idPaciente'),
    "idPsicologo": localStorage.getItem('id'),
    "observaciones": document.getElementById('text-observaciones').value,
    "fecha": getFecha()
  };

  await fetch(`${url}/atenciones`, {
    method: 'POST',
    mode: 'no-cors', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(atencion)
  })

  const responseCita = await fetch(`${url}/citas/${idCita}`, {
      method: 'PUT',
      mode: 'cors', 
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({'estado': 'Finalizada'})
    })

  console.log(responseCita);
  const citas = await getCitas();
  renderCitas(citas, getFecha());
  document.getElementById('detalles-cita').innerHTML='';
}

const showHC = async (idPaciente) => {
  const atenciones = await getAtenciones(idPaciente);
  const divHC = document.getElementById('HC-content');

  if(atenciones.length > 0){
    let elements = '<ul class="list-group">'
    atenciones.forEach(atencion => {
      elements += `<li class="list-group-item">
        <p>Psicólogo: ${atencion.nombreCompleto} - Fecha: ${atencion.fecha.split('T')[0]}</p>
        <p>${atencion.observaciones}</p></li>`
    })

    elements += '</ul>';
    divHC.innerHTML = elements;
  }else{
    divHC.textContent = 'No hay registros';
  }
}

const showTurnos = (turnos) => {

  //const turnosDisp = turnos.filter(turno => turno.estado == "disponible");
  
  const divTurnos = document.getElementById("turnos-disponibles");
  let elements = '';
  if(turnos.length > 0){

    turnos.sort((x, y) =>{
      if(x.fecha < y.fecha){
        return -1;
      }else if(x.fecha > y.fecha){
        return 1;
      }else{
        return ((x.hora < y.hora) ? -1 : ((x.hora > y.hora) ? 1 : 0));
      }
    });

    turnos.forEach(turno => {
      elements += `<div class="card card-body text-center" id="turno-${turno.id}">
                    <p class="card-text">
                      Fecha: ${turno.fecha.split('T')[0]}
                    </p>
                    <p class="card-text">
                      Hora: ${turno.hora}
                    </p>
                    <p class ="card-text">
                      Estado: ${turno.estado}
                    </p>
                  </div>`;
    })
  }
  else{
    divTurnos.innerHTML = '<h3 class="text-center">No hay información para mostrar</h3>';
  }
  divTurnos.innerHTML = elements;
}

const crearTurnos = async (fecha, hora, estado, idPsicologo) => {

  const uri = `${url}/turnos`;

  const newTurno = {
    'fecha': fecha,
    'hora': hora,
    'estado': estado,
    'idPsicologo': idPsicologo
  }

  fetch(uri, {
    method: 'POST',
    mode: 'no-cors', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newTurno)
  })
  
  .catch(e => {
    return undefined;
  })

  return newTurno;

}


window.addEventListener("load", async(event) => {
    const tipo = localStorage.getItem('tipo');
    if(tipo){
        if(tipo!='psicologo'){
            window.location.href='dashboardPaciente.html';
        }
        else{
            const psicologo = await getInfo();
            document.getElementById('saludo').textContent = `Bienvenido ${psicologo[0].nombreCompleto}`;
            document.getElementById('nombre').textContent = `${psicologo[0].nombreCompleto}`;

            const citas = await getCitas();
            const turnos = await getTurnos();

            renderDatos(psicologo[0]);
            renderCitas(citas, getFecha());
            showTurnos(turnos);

            document.getElementById('fecha-citas').value = getFecha();

            //const result = citas.find(item => item.estado == 'No iniciada')

            const divStatus = document.getElementById('status');
            const divInfo = document.getElementById('cita-info');

            
            const result = await getNTurnos();
            if(result){
                divStatus.textContent = 'Estadísticas de turno';
                let elements = '';
                
                  elements += `<h5 class="card-title">Turnos totales: ${result[0].t_totales}</h5>
                              <h5 class="card-title">Turnos disponibles: ${result[1].t_disponibles}</h5>
                              <h5 class="card-title">Turnos ocupados: ${result[2].t_ocupados}</h5>
                              `;
                const divInfo = document.getElementById('nEstadisticas');
                //const todos = await getNTurnosT();
                divInfo.innerHTML = elements
            }else{
                divStatus.textContent = 'Actualmente no tiene estadisticas';
            }
            
        }
    }
    else{
        window.location.href='login.html';
    }
});

const setInvisible = () => {
    const elements = document.getElementsByClassName('option-panel');

    for(let i=0; i<elements.length; i++){
      elements[i].style.display='none';
    }
}

document.getElementById('crear-button')
.addEventListener('click', async (e) =>{
  e.preventDefault();
  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;
  const estado = "disponible";
  const idPsicologo = localStorage.getItem("id");
  const turno = await crearTurnos(fecha, hora, estado, idPsicologo);

  if(turno != undefined){
    showAlertMessage("Turno creado con exito", 'success');
    document.getElementById('form-turno').reset();

    setTimeout(async () => {
      const turnos = await getTurnos();
      showTurnos(turnos);
    }, 1000);
    
  }
  else{
    showAlertMessage("Error al crear un turno", 'danger');
  }

});

document.getElementById('fecha-citas')
.addEventListener('change', async (e) => {
  const citas = await getCitas();
  renderCitas(citas, e.target.value);
  document.getElementById('detalles-cita').innerHTML='';
});

document.getElementById('tab-inicio')
.addEventListener('click', e =>{
  setInvisible();
  document.getElementById('inicio').style.display='block';
});

document.getElementById('tab-agendar')
.addEventListener('click', e =>{
  setInvisible();
  document.getElementById('agendar').style.display='block';
});

/*document.getElementById('tab-creart')
.addEventListener('click', e => {
  setInvisible();
  document.getElementById('crear').style.display='block';
});*/

document.getElementById('tab-citas')
.addEventListener('click', e =>{
  setInvisible();
  document.getElementById('citas').style.display='block';
});

document.getElementById('tab-perfil')
.addEventListener('click', e => {
  setInvisible();
  document.getElementById('perfil').style.display='block';
})