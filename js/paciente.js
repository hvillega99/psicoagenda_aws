const url ='https://s5br3wb0e4.execute-api.us-east-1.amazonaws.com/Prod';

let tieneCita = false;

const showAlertMessage = (message, tipoAlerta) =>{
  const divMessage = document.getElementById('message');
  divMessage.innerHTML =`<div class="alert alert-${tipoAlerta}" role="alert">${message}</div>`;
  setTimeout(()=>{
      divMessage.innerHTML = '';
  },5000);
}

function borrarL() {
  localStorage.removeItem('tipo');
  localStorage.removeItem('id');
  window.location.href='login.html';
}

const agendarCita = async (id) => {
  const newCita = {
    estado: 'No iniciada',
    idPaciente: localStorage.getItem("id"),
    idTurno: id
  };

  const uri = `${url}/citas`;
  await fetch(uri, {
    method: 'POST',
    mode: 'no-cors', 
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(newCita)
  })

  const citas = await getCitas();
  renderStatusCita(citas);
  renderTurnos(localStorage.getItem('idPsicologo'));

  showAlertMessage('Cita agendada exitosamente', 'success');
}

const cancelarCita = async (id) => {
  if(confirm("¿Está seguro?")){
    const uri = `${url}/citas/${id}`;
    await fetch(uri, {
      method: 'DELETE', 
      mode: 'cors',
      headers: {
          'Content-Type': 'application/json'
      }
    })

    const citas = await getCitas();
    renderStatusCita(citas);
    tieneCita = false;
    showAlertMessage('La cita ha sido cancelada', 'warning');
  }
}

const getInfo = async () => {
    const uri = `${url}/pacientes/${localStorage.getItem("id")}`;
    const response = await fetch(uri);
    const result = response.json();
    return result;
}

const getCitas = async () =>{
    const uri = `${url}/citasPorPaciente/${localStorage.getItem("id")}`;
    const response = await fetch(uri);
    const result = response.json();
    return result;
}

const getPsicologos = async () => {
  const response = await fetch(`${url}/psicologos`);
  const psicologos = response.json();
  return psicologos;
}

const renderHistorialCitas = (citas) => {
    const citasAnteriores = citas.filter(cita => cita.estado == 'Finalizada');
    const divHistorial = document.getElementById('historial');

    if(citasAnteriores.length > 0){
        let table = `<table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Psicólogo</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Hora</th>
                            </tr>
                        </thead>
                        <tbody>`;

        citasAnteriores.forEach(element => {
            table +=`<tr>
                        <td>${element.nombreCompleto}</td>
                        <td>${element.fecha.split('T')[0]}</td>
                        <td>${element.hora}</td>
                    </tr>`;
        });

        table += `</tbody></table>`;

        divHistorial.innerHTML ='<h3 class="text-center">Historial de citas</h3>' + table;
    }else{
        divHistorial.innerHTML = '<h3 class="text-center">No hay información para mostrar</h3>';
    }
    
}

const renderDatos = (paciente) => {
  document.getElementById('saludo').textContent = `¡Hola ${paciente.nombreCompleto}!`;
  document.getElementById('nombre').textContent = `${paciente.nombreCompleto}`;

  document.getElementById('perfilNombre').textContent = `Nombre: ${paciente.nombreCompleto}`;
  document.getElementById('perfilCedula').textContent = `Cédula: ${paciente.cedula}`;
  document.getElementById('perfilMail').textContent = `Email: ${paciente.email}`;
}

const renderStatusCita = (citas) => {
  const result = citas.find(item => item.estado == 'No iniciada');

  const divStatus = document.getElementById('status');
  const divInfo = document.getElementById('cita-info');

  if(result){
      tieneCita = true;
      divStatus.textContent = 'Usted tiene una cita agendada';
      divInfo.innerHTML = `<div class="card text-center" id="cita-${result.id}">
      <div class="card-header">
        Información de la cita
      </div>
      <div class="card-body">
        <h5 class="card-title">Psicólogo: ${result.nombreCompleto}</h5>
        <p class="card-text">
          Fecha: ${result.fecha.split('T')[0]}
          Hora: ${result.hora}
        </p>
        <button class="btn btn-danger" onclick=cancelarCita(${result.id})>Cancelar</button>
      </div>
    </div>`

  }else{
    divStatus.textContent = 'Actualmente no tiene una cita agendada';
    divInfo.innerHTML = `<img src="./img/sad.png" class="img-fluid w-25 h-25" alt="psi">`;
  }
}

const filterTurnos = (arrayTurnos) => {
  const fecha = new Date();
  const now = `${fecha.getHours()}:${fecha.getMinutes()}`;
  const dateItems = fecha.toLocaleDateString().split('/');
  const today = `${dateItems[2]}-${dateItems[1].length < 2? '0'+dateItems[1]:dateItems[1]}-${dateItems[0].length < 2? '0'+dateItems[0]:dateItems[0]}`
  
  return arrayTurnos.filter(turno => {
    if(turno.fecha > today){
      return true;
    }else if(turno.fecha == today){
      return turno.hora > now;
    }
    return false
  });
}

const sortTurnos = (turnos) => {
  return turnos.sort((x, y) =>{
    if(x.fecha < y.fecha){
      return -1;
    }else if(x.fecha > y.fecha){
      return 1;
    }else{
      return ((x.hora < y.hora) ? -1 : ((x.hora > y.hora) ? 1 : 0));
    }
  });
}

const renderTurnos = async (idPsicologo) => {
  localStorage.setItem('idPsicologo', idPsicologo);
  const response = await fetch(`${url}/turnosDisponibles/${idPsicologo}`);
  const allTurnos = await response.json();

  let turnos = filterTurnos(allTurnos);
  turnos = sortTurnos(turnos);

  const divTurnos = document.getElementById('turnos-disponibles');
  let elements = '';
  turnos.forEach(turno => {
    elements += `<div class="card card-body text-center" id="turno-${turno.id}">
                    <p class="card-text">
                      Fecha: ${turno.fecha.split('T')[0]}
                    </p>
                    <p class="card-text">
                      Hora: ${turno.hora}
                    </p>`;
    if(!tieneCita){
      elements += `<button type="button" class="btn btn-primary" onclick=agendarCita(${turno.id})>Agendar</button>`;
    }

    elements += '</div>';

  })
  divTurnos.innerHTML = elements;
}

const renderPsicologos = (psicologos) =>{
  const divPsicologos = document.getElementById('psicologos')
  let lista = `<div class="btn-group d-flex flex-column" 
                role="group" aria-label="Basic radio toggle button group">`;

  psicologos.forEach(item => {
    lista += `<input type="radio" class="btn-check" name="btnradio" id="psicologo-${item.id}" 
              autocomplete="off" cheked onclick=renderTurnos(${item.id})>
              <label class="btn btn-outline-primary" for="psicologo-${item.id}">
                ${item.nombreCompleto}
              </label>`
  })
  
  divPsicologos.innerHTML = lista + '</div>';
}

window.addEventListener("load", async (event) => {
    const tipo = localStorage.getItem('tipo');
    if(tipo){
        if(tipo!='paciente'){
            window.location.href='dashboardPsicologo.html';
        }else{
            const paciente = await getInfo();
            renderDatos(paciente[0]);
            
            const citas = await getCitas();
            renderStatusCita(citas);
            renderHistorialCitas(citas);

            const psicologos = await getPsicologos();
            renderPsicologos(psicologos);

        }
    }else{
        window.location.href='login.html';
    }
});


const setInvisible = () => {
    const elements = document.getElementsByClassName('option-panel');

    for(let i=0; i<elements.length; i++){
      elements[i].style.display='none';
    }
}
  
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
  
document.getElementById('tab-historial')
.addEventListener('click', e =>{
  setInvisible();
  document.getElementById('historial').style.display='block';
});

document.getElementById('tab-perfil')
.addEventListener('click', e =>{
  setInvisible();
  document.getElementById('perfil').style.display='block';
});