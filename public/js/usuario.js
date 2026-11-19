const formPessoal = document.getElementById('form-pessoal');

if (formPessoal) {
  formPessoal.addEventListener('submit', async function (e) {
    e.preventDefault();

    const senha = document.getElementById('senha').value;
    const confSenha = document.getElementById('confirmar_senha').value;

    if (senha !== confSenha) {
      exibirAlerta('alerta-pessoal', 'As senhas digitadas não coincidem.', 'erro');
      return;
    }

    const veiculoSel = document.querySelector('.item-veiculo.selected');
    const veiculoPref = veiculoSel ? veiculoSel.getAttribute('data-veiculo') : 'Carro';

    const dados = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      senha: senha,
      cpf_cnpj: document.getElementById('cpf').value || '',
      cidade: document.getElementById('cidade').value || '',
      veiculo_preferencia: veiculoPref,
      tipo_conta: 'pessoal'
    };

    try {
      const resp = await fetch('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const resJson = await resp.json();

      if (resp.ok) {
        exibirAlerta('alerta-pessoal', '🎉 Cadastro realizado com sucesso! Redirecionando para o Login...', 'sucesso');
        formPessoal.reset();
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        exibirAlerta('alerta-pessoal', resJson.mensagem || 'Erro ao realizar cadastro.', 'erro');
      }
    } catch (err) {
      exibirAlerta('alerta-pessoal', 'Erro de comunicação com o servidor backend.', 'erro');
    }
  });
}
