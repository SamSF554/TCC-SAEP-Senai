const formLogin = document.getElementById('form-login');

if (formLogin) {
  formLogin.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('login_email').value;
    const senha = document.getElementById('login_senha').value;

    try {
      const resp = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const json = await resp.json();

      if (resp.ok) {
        exibirAlerta('alerta-login', 'Login efetuado com sucesso!', 'sucesso');
        localStorage.setItem('token', json.token);
        localStorage.setItem('usuario', JSON.stringify(json.usuario));

        setTimeout(() => {
          // REQUISITO 1: Redirecionamento automático do Administrador para admin.html
          if (json.usuario.perfil === 'administrador') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'entregas.html';
          }
        }, 800);
      } else {
        exibirAlerta('alerta-login', json.mensagem || 'E-mail ou senha incorretos.', 'erro');
      }
    } catch (err) {
      exibirAlerta('alerta-login', 'Erro ao conectar ao servidor.', 'erro');
    }
  });
}