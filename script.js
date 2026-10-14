const campoTarefa = document.getElementById('campo-tarefa');
const campoPrazo = document.getElementById('campo-prazo');
const campoCategoria = document.getElementById('campo-categoria');
const campoPrioridade = document.getElementById('campo-prioridade');

const botaoAdicionar = document.getElementById('botao-adicionar');
const botaoAlternarTema = document.getElementById('botao-alternar-tema');
const botaoNovidades = document.getElementById('botao-novidades');

const listaTarefas = document.getElementById('lista-tarefas');
const listaConcluidas = document.getElementById('lista-concluidas');
const listaAtrasadas = document.getElementById('lista-atrasadas');

const contadorTarefas = document.getElementById('contador-tarefas');

const cardConcluidas = document.getElementById('card-concluidas');
const cardAtrasadas = document.getElementById('card-atrasadas');

const botoesFiltro = document.querySelectorAll('.filtro');

const modalNovidades = document.getElementById('modal-novidades');
const fecharNovidades = document.getElementById('fechar-novidades');

let tarefas = [];

try {
    const tarefasSalvas = JSON.parse(
        localStorage.getItem('tarefas')
    );

    if (Array.isArray(tarefasSalvas)) {
        tarefas = tarefasSalvas;
    }
} catch (erro) {
    console.error('Não foi possível carregar as tarefas:', erro);
}

let filtroAtual = 'todas';

let estadosAtraso = new Map();

function salvarTarefas() {
    try {
        localStorage.setItem(
            'tarefas',
            JSON.stringify(tarefas)
        );
    } catch (erro) {
        alert('Não foi possível salvar as tarefas no navegador.');
        console.error(erro);
    }
}

function adicionarTarefa() {
    const texto = campoTarefa.value.trim();
    const prazo = campoPrazo.value;
    const categoria = campoCategoria.value;
    const prioridade = campoPrioridade.value;

    if (texto === '') {
        alert('Por favor, digite uma tarefa!');
        campoTarefa.focus();
        return;
    }

    if (prazo === '') {
        alert('Por favor, coloque um prazo para a tarefa!');
        campoPrazo.focus();
        return;
    }

    if (Number.isNaN(new Date(prazo).getTime())) {
        alert('Por favor, informe uma data e hora válidas!');
        campoPrazo.focus();
        return;
    }

    const novaTarefa = {
        id: Date.now(),
        texto: texto,
        prazo: prazo,
        categoria: categoria,
        prioridade: prioridade,
        concluida: false
    };

    tarefas.push(novaTarefa);

    salvarTarefas();
    renderizarTarefas();

    campoTarefa.value = '';
    campoPrazo.value = '';

    campoTarefa.focus();
}

function formatarData(data) {
    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return 'Data inválida';
    }

    return dataFormatada.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderizarTarefas() {
    listaTarefas.innerHTML = '';
    listaConcluidas.innerHTML = '';
    listaAtrasadas.innerHTML = '';

    const agora = new Date();

    // Atualiza o registro dos estados de atraso.
    estadosAtraso = new Map();

    tarefas.forEach(tarefa => {
        // Compatibilidade com tarefas salvas anteriormente.
        if (!tarefa.categoria) {
            tarefa.categoria = 'Pessoal';
        }

        if (!tarefa.prioridade) {
            tarefa.prioridade = 'media';
        }

        if (typeof tarefa.concluida !== 'boolean') {
            tarefa.concluida = false;
        }

        const prazo = new Date(tarefa.prazo);

        const atrasada =
            !tarefa.concluida &&
            !Number.isNaN(prazo.getTime()) &&
            prazo < agora;

        estadosAtraso.set(tarefa.id, atrasada);

        // Criar o elemento da tarefa.
        const itemLista = document.createElement('li');

        itemLista.className = 'item-tarefa';
        itemLista.dataset.id = tarefa.id;

        if (tarefa.concluida) {
            itemLista.classList.add('concluido');
        }

        if (atrasada) {
            itemLista.classList.add('atrasada');
        }

        // Informações da tarefa.
        const informacoes = document.createElement('div');

        informacoes.className = 'informacoes-tarefa';

        const textoTarefa = document.createElement('span');

        textoTarefa.className = 'texto-tarefa';
        textoTarefa.textContent = tarefa.texto;

        const detalhes = document.createElement('small');

        detalhes.textContent =
            `📅 ${formatarData(tarefa.prazo)} • 🏷️ ${tarefa.categoria}`;

        // Prioridade.
        const prioridade = document.createElement('span');

        prioridade.className = `prioridade ${tarefa.prioridade}`;

        if (tarefa.prioridade === 'alta') {
            prioridade.textContent = '🔴 Alta';
        } else if (tarefa.prioridade === 'media') {
            prioridade.textContent = '🟡 Média';
        } else {
            prioridade.textContent = '🟢 Baixa';
        }

        informacoes.appendChild(textoTarefa);
        informacoes.appendChild(detalhes);
        informacoes.appendChild(prioridade);

        // Botões de ação.
        const acoes = document.createElement('div');

        acoes.className = 'acoes-tarefa';

        const botaoConcluir = document.createElement('button');

        botaoConcluir.className = 'botao-acao concluir';
        botaoConcluir.title = tarefa.concluida
            ? 'Reabrir tarefa'
            : 'Concluir tarefa';

        botaoConcluir.setAttribute(
            'aria-label',
            botaoConcluir.title
        );

        botaoConcluir.innerHTML = tarefa.concluida
            ? '<i class="fa-solid fa-circle-check"></i>'
            : '<i class="fa-regular fa-circle-check"></i>';

        const botaoEditar = document.createElement('button');

        botaoEditar.className = 'botao-acao editar';
        botaoEditar.title = 'Editar tarefa';
        botaoEditar.setAttribute('aria-label', 'Editar tarefa');
        botaoEditar.innerHTML = '<i class="fa-solid fa-pen"></i>';

        const botaoExcluir = document.createElement('button');

        botaoExcluir.className = 'botao-acao excluir';
        botaoExcluir.title = 'Excluir tarefa';
        botaoExcluir.setAttribute('aria-label', 'Excluir tarefa');
        botaoExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';

        acoes.appendChild(botaoConcluir);
        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

        itemLista.appendChild(informacoes);
        itemLista.appendChild(acoes);

        // Colocar cada tarefa no card correspondente.
        if (tarefa.concluida) {
            listaConcluidas.appendChild(itemLista);
        } else if (atrasada) {
            listaAtrasadas.appendChild(itemLista);
        } else {
            listaTarefas.appendChild(itemLista);
        }

        // CONCLUIR OU REABRIR.
        botaoConcluir.addEventListener('click', () => {
            tarefa.concluida = !tarefa.concluida;

            salvarTarefas();
            renderizarTarefas();
        });

        // EDITAR.
        botaoEditar.addEventListener('click', () => {
            const novoTexto = prompt(
                'Edite sua tarefa:',
                tarefa.texto
            );

            if (
                novoTexto !== null &&
                novoTexto.trim() !== ''
            ) {
                tarefa.texto = novoTexto.trim();

                salvarTarefas();
                renderizarTarefas();
            }
        });

        // EXCLUIR.
        botaoExcluir.addEventListener('click', () => {
            const confirmar = confirm(
                `Deseja excluir a tarefa "${tarefa.texto}"?`
            );

            if (!confirmar) {
                return;
            }

            tarefas = tarefas.filter(
                item => item.id !== tarefa.id
            );

            salvarTarefas();
            renderizarTarefas();
        });
    });

    atualizarContador();
    verificarCards();
}

function atualizarContador() {
    const quantidade = tarefas.length;

    contadorTarefas.textContent =
        `${quantidade} ${quantidade === 1 ? 'tarefa' : 'tarefas'} na lista`;
}

function verificarCards() {
    const existemConcluidas = tarefas.some(
        tarefa => tarefa.concluida
    );

    const agora = new Date();

    const existemAtrasadas = tarefas.some(tarefa => {
        return (
            !tarefa.concluida &&
            new Date(tarefa.prazo) < agora
        );
    });

    // Filtro "Concluídas": mostra apenas esse grupo.
    listaTarefas.style.display =
        filtroAtual === 'concluidas' ? 'none' : '';

    cardAtrasadas.classList.toggle(
        'visivel',
        existemAtrasadas && filtroAtual !== 'concluidas'
    );

    cardConcluidas.classList.toggle(
        'visivel',
        existemConcluidas && filtroAtual !== 'pendentes'
    );
}

botoesFiltro.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesFiltro.forEach(item => {
            item.classList.remove('ativo');
        });

        botao.classList.add('ativo');

        filtroAtual = botao.dataset.filtro;

        verificarCards();
    });
});

function atualizarIconeTema() {
    const iconeTema = botaoAlternarTema.querySelector('i');

    const escuro = document.body.classList.contains('modo-escuro');

    iconeTema.classList.toggle('fa-moon', !escuro);
    iconeTema.classList.toggle('fa-sun', escuro);
}

// Recuperar tema salvo.
try {
    if (localStorage.getItem('tema') === 'escuro') {
        document.body.classList.add('modo-escuro');
    }
} catch (erro) {
    console.error('Não foi possível recuperar o tema:', erro);
}

atualizarIconeTema();

botaoAlternarTema.addEventListener('click', () => {
    document.body.classList.toggle('modo-escuro');

    const temaAtual = document.body.classList.contains('modo-escuro')
        ? 'escuro'
        : 'claro';

    try {
        localStorage.setItem('tema', temaAtual);
    } catch (erro) {
        console.error('Não foi possível salvar o tema:', erro);
    }

    atualizarIconeTema();
});

function abrirModalNovidades() {
    modalNovidades.classList.add('aberto');
    modalNovidades.setAttribute('aria-hidden', 'false');

    fecharNovidades.focus();
}

function fecharModalNovidades() {
    modalNovidades.classList.remove('aberto');
    modalNovidades.setAttribute('aria-hidden', 'true');

    botaoNovidades.focus();
}

botaoNovidades.addEventListener('click', abrirModalNovidades);

fecharNovidades.addEventListener('click', fecharModalNovidades);

// Fechar ao clicar no fundo, fora do conteúdo.
modalNovidades.addEventListener('click', evento => {
    if (evento.target === modalNovidades) {
        fecharModalNovidades();
    }
});

document.addEventListener('keydown', evento => {
    if (
        evento.key === 'Escape' &&
        modalNovidades.classList.contains('aberto')
    ) {
        fecharModalNovidades();
    }
});

botaoAdicionar.addEventListener('click', adicionarTarefa);

campoTarefa.addEventListener('keydown', evento => {
    if (evento.key === 'Enter') {
        adicionarTarefa();
    }
});

function verificarMudancasDePrazo() {
    const agora = new Date();
    let precisaAtualizar = false;

    tarefas.forEach(tarefa => {
        const prazo = new Date(tarefa.prazo);

        const atrasada =
            !tarefa.concluida &&
            !Number.isNaN(prazo.getTime()) &&
            prazo < agora;

        const estadoAnterior = estadosAtraso.get(tarefa.id);

        if (
            estadoAnterior !== undefined &&
            estadoAnterior !== atrasada
        ) {
            precisaAtualizar = true;
        }
    });

    if (precisaAtualizar) {
        renderizarTarefas();
    }
}
setInterval(verificarMudancasDePrazo, 15000);

renderizarTarefas();