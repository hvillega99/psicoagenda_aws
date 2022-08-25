const url = 'https://s5br3wb0e4.execute-api.us-east-1.amazonaws.com/Prod';

const auth = async (email, password) => {
    const responsePacientes = await fetch(`${url}/pacientes`);
    const pacientes = await responsePacientes.json();
    const paciente = pacientes.find(item => item.email == email);
    if(paciente){
        return{
            id: paciente.id,
            tipo: 'paciente',
            clave: paciente.clave == password
        }
    }

    const responsePsicologos = await fetch(`${url}/psicologos`);
    const psicologos = await responsePsicologos.json();
    const psicologo = psicologos.find(item => item.email == email);
    if(psicologo){
        return{
            id: psicologo.id,
            tipo: 'psicologo',
            clave: psicologo.clave == password
        }
    }

    return undefined;
}

const showAlertMessage = message =>{
    const divMessage = document.getElementById('message');
    divMessage.innerHTML =`<div class="alert alert-danger" role="alert">${message}</div>`;
    setTimeout(()=>{
        divMessage.innerHTML = '';
    },5000);
}

window.addEventListener("load", function(event) {
    const id = localStorage.getItem('id');
    if(id){
        window.location.href='index.html';
    }
});

document.getElementById('login-form')
.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const result = await auth(email,password);

    if(result){
        if(!result.clave){
            showAlertMessage('Contraseña incorrecta');
        }else{
            localStorage.setItem('id', result.id);
            localStorage.setItem('tipo', result.tipo);
            if(result.tipo == 'paciente'){
                window.location.href='dashboardPaciente.html';
            }else{
                window.location.href='dashboardPsicologo.html';
            }
        }
    }else{
        showAlertMessage('El correo ingresado no está vinculado a ningún usuario');   
    }
});