const formCorp = document.getElementById('form-corporativo');

if (formCorp) {
  formCorp.addEventListener('submit', async function (e) {
    e.preventDefault();

    const senha = document.getElementById('senha').value;
    const confSenha = document.getElementById('confirmar_senha').value;

    if (senha !== confSenha) {
      exibirAlerta('alerta-corp', 'As senhas digitadas não coincidem.', 'erro');
      return;
    }

    const veiculoSel = document.querySelector('.item-veiculo.selected');
    const veiculoPref = veiculoSel ? veiculoSel.getAttribute('data-veiculo') : 'Carro';

    const dados = {
      nome: document.getElementById('nome_empresa').value,
      email: document.getElementById('email').value,
      senha: senha,
      cpf_cnpj: document.getElementById('cnpj').value || '',
      cidade: document.getElementById('cidade').value || '',
      veiculo_preferencia: veiculoPref,
      tipo_conta: 'corporativa'
    };

    try {
      const resp = await fetch('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const resJson = await resp.json();

      if (resp.ok) {
        exibirAlerta('alerta-corp', '🎉 Cadastro corporativo efetuado! Redirecionando para o Login...', 'sucesso');
        formCorp.reset();

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        exibirAlerta('alerta-corp', resJson.mensagem || 'Erro ao realizar cadastro corporativo.', 'erro');
      }
    } catch (err) {
      exibirAlerta('alerta-corp', 'Erro de comunicação com o servidor backend.', 'erro');
    }
  });
}
