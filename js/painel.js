document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://dtobscffuwsfreqxohln.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0b2JzY2ZmdXdzZnJlcXhvaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MzUyMzYsImV4cCI6MjA0MzAxMTIzNn0.Q0TbOqIJLHTx-T9P-5NcPC2ekn4atw8TcU16ifQ0JYM';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const empresa = localStorage.getItem('empresa') || 'Nome da empresa não disponível';

    // Atualizar o cabeçalho
    const headerP = document.querySelector('#header p');
    if (headerP) {
        headerP.textContent = empresa;
    } else {
        console.error('Elemento #header p não encontrado');
    }

    const listaAlunos = document.getElementById('lista-alunos');

    async function carregarAlunos() {
        try {
            const { data, error } = await supabaseClient
                .from('alunos')
                .select('id, foto_perfil, nome, turma');

            if (error) {
                console.error('Erro ao buscar alunos:', error);
                return;
            }

            data.sort((a, b) => a.nome.localeCompare(b.nome));

            listaAlunos.innerHTML = '';
            data.forEach(aluno => {
                const alunoCard = document.createElement('div');
                alunoCard.className = 'aluno-card';
                alunoCard.dataset.alunoId = aluno.id; // Certifique-se de atribuir o id corretamente

                alunoCard.innerHTML = `
                    <img src="${aluno.foto_perfil}" alt="Foto de ${aluno.nome}">
                    <h3>${aluno.nome}</h3>
                    <p><span>Turma: </span>${aluno.turma}</p>
                    <div class="menu-aluno">
                        <button class="menu-button">...</button>
                        <div class="menu-options">
                            <button class="excluir-aluno">Excluir</button>
                            <button class="adicionar-relacao">Adicionar Relação</button>
                        </div>
                    </div>
                `;

                listaAlunos.appendChild(alunoCard);
            });
        } catch (erro) {
            console.error('Erro inesperado:', erro);
        }
    }

    // Modal
    // Seleção de elementos
    const btnAdicionarAluno = document.getElementById('btn-adicionar-aluno');
    const modal = document.getElementById('modal-adicionar-aluno');
    const closeModal = document.querySelector('.modal-content .close');

    // Abrir o modal
    btnAdicionarAluno.addEventListener('click', () => {
        modal.style.display = 'flex'; // Mostra o modal
    });

    // Fechar o modal ao clicar no "X"
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none'; // Esconde o modal
    });

    // Fechar o modal ao clicar fora do conteúdo do modal (clicando no fundo)
    window.addEventListener('click', (event) => {
        if (event.target === modal) { // Verifica se clicou no fundo (overlay)
            modal.style.display = 'none'; // Esconde o modal
        }
    });

    // Carregar turmas ao selecionar tipo de ensino
    const carregarTurmas = (tipoEnsino) => {
        const turmaSelect = document.getElementById('turma-aluno');
        turmaSelect.innerHTML = "<option value=''>Selecione uma turma</option>";

        const turmasPorEnsino = {
            EFI: [
                "1º ano A EFI", "1º ano B EFI", "2º ano A EFI", "2º ano B EFI", "3º ano A EFI", "3º ano B EFI", "4º ano A EFI", "4º ano B EFI", "5º ano A EFI", "5º ano B EFI"
            ],
            EFII: [
                "6º ano A EFII", "6º ano B EFII", "7º ano A EFII", "7º ano B EFII", "8º ano A EFII", "8º ano B EFII", "9º ano A EFII", "9º ano B EFII"
            ],
            NEM: [
                "1º ano A NEM", "1º ano B NEM", "2º ano A NEM", "2º ano B NEM", "3º ano A NEM", "3º ano B NEM"
            ]
        };

        if (turmasPorEnsino[tipoEnsino]) {
            turmasPorEnsino[tipoEnsino].forEach((turma) => {
                const option = new Option(turma, turma);
                turmaSelect.add(option);
            });
        }
    };

    document.getElementById('tipo-ensino-aluno').addEventListener('change', (event) => {
        carregarTurmas(event.target.value);
    });

    // Adicionar aluno
    document.getElementById('form-aluno').addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome-aluno').value.trim();
        const turma = document.getElementById('turma-aluno').value.trim();
        const genero = document.getElementById('genero-aluno').value;

        if (!nome || !turma || !genero) {
            alert('Todos os campos são obrigatórios.');
            return;
        }

        const { error } = await supabaseClient
            .from('alunos')
            .insert([{ nome, turma, genero, criado_em: new Date().toISOString() }]);

        if (error) {
            alert(`Erro: ${error.message}`);
        } else {
            alert('Aluno adicionado com sucesso!');
            modal.classList.add('hidden');
            document.getElementById('form-aluno').reset();
            carregarAlunos(); // Atualiza a lista de alunos
        }
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('excluir-aluno')) {
            const confirmacao = confirm('Tem certeza que deseja excluir este aluno?');
            if (confirmacao) {
                // Aqui você chama a função para excluir o aluno
                excluirAluno(event.target);
            }
        }
    });

    async function excluirAluno(button) {
        const alunoCard = button.closest('.aluno-card'); // Obtém o card do aluno
        const alunoId = alunoCard ? alunoCard.dataset.alunoId : null; // Obtém o id do aluno

        if (!alunoId) {
            console.error('Aluno ID não encontrado');
            return; // Não prosseguir se o id não estiver presente
        }

        const { error } = await supabaseClient
            .from('alunos')
            .delete()
            .eq('id', alunoId); // Passa o UUID do aluno corretamente para o Supabase

        if (error) {
            alert(`Erro ao excluir aluno: ${error.message}`);
        } else {
            alert('Aluno excluído com sucesso!');
            carregarAlunos(); // Atualiza a lista de alunos após a exclusão
        }
    }

    // Exibir o modal de adicionar relação com o ID do aluno
    async function mostrarModalAdicionarRelacao(target) {
        const alunoCard = target.closest('.aluno-card');
        const alunoId = alunoCard ? alunoCard.dataset.alunoId : null;

        if (!alunoId) {
            console.error('ID do aluno não encontrado');
            return;
        }

        // Exibir o modal
        const modalRelacao = document.getElementById('modal-relacao');
        modalRelacao.style.display = 'flex';

        // Salvar o alunoId no modal
        modalRelacao.dataset.alunoId = alunoId;

        // Carregar os professores
        await carregarDropdownProfessores();
    }

    async function carregarDropdownProfessores() {
        try {
            const { data: professores, error } = await supabaseClient
                .from('responsaveis')
                .select('id, nome')
                .eq('tipo', 'professor');

            const professorSelect = document.getElementById('professor-nome');
            professorSelect.innerHTML = '';

            if (error) {
                console.error('Erro ao carregar professores:', error);
                return;
            }

            professores.forEach(({ id, nome }) => {
                const option = new Option(nome, id);
                professorSelect.add(option);
            });
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
        }
    }

    // Criar relação entre professor e aluno com verificação
    document.getElementById('form-professor-aluno').addEventListener('submit', async (event) => {
        event.preventDefault();

        const modalRelacao = document.getElementById('modal-relacao');
        const alunoId = modalRelacao.dataset.alunoId;
        const professorId = document.getElementById('professor-nome').value;

        if (!professorId || !alunoId) {
            alert('Selecione um professor.');
            return;
        }

        try {
            // Verificar se já existe uma relação entre o professor e o aluno
            const { data: relacaoExistente, error: erroVerificacao } = await supabaseClient
                .from('professor_aluno')
                .select('*')
                .eq('professor_id', professorId)
                .eq('aluno_id', alunoId)
                .single(); // Retorna um único resultado

            if (erroVerificacao) {
                console.error('Erro ao verificar relação existente:', erroVerificacao);
                alert('Erro ao verificar relação existente.');
                return;
            }

            if (relacaoExistente) {
                alert('Já existe uma relação entre este professor e aluno.');
                return;
            }

            // Criar nova relação
            const { error: erroCriacao } = await supabaseClient
                .from('professor_aluno')
                .insert([{ professor_id: professorId, aluno_id: alunoId }]);

            if (erroCriacao) {
                alert(`Erro ao criar relação: ${erroCriacao.message}`);
            } else {
                alert('Relação criada com sucesso!');
                modalRelacao.style.display = 'none';
            }
        } catch (erro) {
            console.error('Erro inesperado ao criar relação:', erro);
            alert('Erro inesperado ao criar relação.');
        }
    });


    // Fechar modal de relação
    const closeModalRelacao = document.querySelector('#modal-relacao .close');
    closeModalRelacao.addEventListener('click', () => {
        document.getElementById('modal-relacao').style.display = 'none';
    });

    // Evento de clique para mostrar o modal
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('adicionar-relacao')) {
            mostrarModalAdicionarRelacao(event.target);
        }
    });
    carregarAlunos();
});
