const url ='https://s5br3wb0e4.execute-api.us-east-1.amazonaws.com/Prod';

window.addEventListener("load", function(event) {
    const id = localStorage.getItem('id');
    if(id){
        window.location.href='index.html';
    }
});

let flag = false;

const existeEmail = async (email, tipoUsuario) => {
    const uri = `${url}/${tipoUsuario}`;
    const response = await fetch(uri);
    const elements = await response.json();
    const result = elements.find(element => element.email == email);
    return result != undefined;
}

const register = async (fullName, cedula, email, password, tipo) => {

    if(!(await existeEmail(email, 'pacientes')) && !(await existeEmail(email, 'psicologos'))){

        const uri = `${url}/${tipo}`;

        const newUser = {
            'cedula': cedula,
            'nombreCompleto': fullName,
            'email': email,
            'clave': password
        }

        fetch(uri, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
        .catch(e => {
            return undefined;
        })

        return {
            email: true
        }
    }else{
        return {
            email: false
        }
    }
}

const showAlertMessage = (message, tipoAlerta) =>{
    const divMessage = document.getElementById('message');
    divMessage.innerHTML =`<div class="alert alert-${tipoAlerta}" role="alert">${message}</div>`;
    setTimeout(()=>{
        divMessage.innerHTML = '';
    },5000);
}

document.getElementById('registro-form')
.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = document.getElementById('fullname');
    const cedula = document.getElementById('cedula');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const password2 = document.getElementById('password2');
    const tipo = document.getElementById('radio-paciente').checked ? 'pacientes' : 'psicologos';

    if(!flag){
        showAlertMessage('Corrija la contraseña.', 'danger');
    }else{
        const result = await register(fullname.value, cedula.value, email.value, password.value, tipo);
        if(result){
            if(result.email){
                showAlertMessage('Usuario registrado con éxito.', 'success');
                e.target.reset();
                password.className = 'form-control';
                password2.className = 'form-control';
            }else{
                showAlertMessage('El correo electrónico ingresado está registrado con otro usuario.', 'danger');
            }
        }else{
            showAlertMessage('Ocurrió un error, intente más tarde.', 'danger');
        }
    }
});

document.getElementById('password2')
.addEventListener('input', e => {
    const password = document.getElementById('password').value;
    const feedback = document.getElementById('passwordHelpInline2');

    if(password != e.target.value){
        e.target.className = 'form-control is-invalid';
        feedback.textContent = 'Las contraseñas no coinciden.';
        flag = false;
    }else{
        e.target.className = 'form-control is-valid';
        feedback.textContent = '';
        flag = true;
    }
})

document.getElementById('password')
.addEventListener('input', e => {
    const feedback = document.getElementById('passwordHelpInline');
    if(e.target.value.length < 8 || e.target.value.length > 20){
        e.target.className = 'form-control is-invalid';
        feedback.textContent = 'La contraseña debe tener entre 8 y 20 caracteres.';
        flag = false;
    }else{
        e.target.className = 'form-control is-valid';
        feedback.textContent = '';
        flag = true;
    }
})