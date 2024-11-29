document.addEventListener('DOMContentLoaded', () => {
    //CHAMANDO O SUPABASE
    const SUPABASE_URL = 'https://dtobscffuwsfreqxohln.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0b2JzY2ZmdXdzZnJlcXhvaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MzUyMzYsImV4cCI6MjA0MzAxMTIzNn0.Q0TbOqIJLHTx-T9P-5NcPC2ekn4atw8TcU16ifQ0JYM';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


    const menuItems = document.querySelectorAll('.selecao .parte');
    const paineis = document.querySelectorAll('.painel-alunos, .painel-professores, .painel-responsaveis');
    const lateralMenu = document.getElementById('lateral');

    // Função para esconder todos os painéis
    const esconderTodosOsPaineis = () => {
        paineis.forEach(painel => {
            painel.style.display = 'none';
        });
    };

    // Função para mostrar o painel selecionado
    const mostrarPainel = (painelClass) => {
        const painel = document.querySelector(`.${painelClass}`);
        if (painel) {
            painel.style.display = 'block';
        }
    };

    // Mostrar painel de alunos por padrão
    mostrarPainel('painel-alunos');

    // Adicionar ou remover a classe 'ativo' ao clicar nos itens do menu
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const painelClass = item.dataset.target;

            // Remover a classe 'ativo' de todos os itens do menu
            menuItems.forEach(i => i.classList.remove('ativo'));

            // Adicionar a classe 'ativo' ao item clicado
            item.classList.add('ativo');

            // Esconder todos os painéis e mostrar o painel correspondente
            esconderTodosOsPaineis();
            mostrarPainel(`painel-${painelClass}`);
        });
    });


    //CABEÇALHO
    const empresa = localStorage.getItem('empresa') || 'Nome da empresa não disponível';
    const headerP = document.querySelector('#header p');
    if (headerP) {
        headerP.textContent = empresa;
    } else {
        console.error('Elemento #header p não encontrado');
    }

    //ALUNOS
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
    carregarAlunos();

    // MODAL ALUNOS
    const btnAdicionarAluno = document.getElementById('btn-adicionar-aluno');
    const modal = document.getElementById('modal-adicionar-aluno');
    const closeModal = document.querySelector('.modal-content .close');

    btnAdicionarAluno.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // TIPOS DE ENSINO
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

    // ADICIONAR ALUNO
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
            carregarAlunos();
        }
    });

    //EXCLUIR ALUNO
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('excluir-aluno')) {
            const confirmacao = confirm('Tem certeza que deseja excluir este aluno?');
            if (confirmacao) {
                excluirAluno(event.target);
            }
        }
    });

    async function excluirAluno(button) {
        const alunoCard = button.closest('.aluno-card');
        const alunoId = alunoCard ? alunoCard.dataset.alunoId : null;

        if (!alunoId) {
            console.error('Aluno ID não encontrado');
            return;
        }

        const { error } = await supabaseClient
            .from('alunos')
            .delete()
            .eq('id', alunoId);

        if (error) {
            alert(`Erro ao excluir aluno: ${error.message}`);
        } else {
            alert('Aluno excluído com sucesso!');
            carregarAlunos();
        }
    }

    document.getElementById("pesquisa-aluno").addEventListener("input", async (e) => {
        const termo = e.target.value.toLowerCase();

        const { data, error } = await supabaseClient
            .from("alunos")
            .select("*")
            .ilike("nome", `%${termo}%`);

        if (error) {
            console.error("Erro ao buscar alunos:", error);
            return;
        }

        listaAlunos.innerHTML = "";
        data.forEach((aluno) => {
            const alunoCard = document.createElement("div");
            alunoCard.className = "aluno-card";
            alunoCard.dataset.alunoId = aluno.id;
            alunoCard.innerHTML = `
        <img src="${aluno.foto_perfil}" alt="Foto de ${aluno.nome}">
            <h3>${aluno.nome}</h3>
            <p>${aluno.email}</p>
            <div class="menu-aluno">
                    <button class="menu-button">...</button>
                    <div class="menu-options">
                        <button class="excluir-aluno">Excluir</button>
                    </div>
                </div>
      `;
            listaAlunos.appendChild(alunoCard);
        });
    });

    //MODAL RELAÇÃO
    async function mostrarModalAdicionarRelacao(target) {
        const alunoCard = target.closest('.aluno-card');
        const alunoId = alunoCard ? alunoCard.dataset.alunoId : null;

        if (!alunoId) {
            console.error('ID do aluno não encontrado');
            return;
        }

        const modalRelacao = document.getElementById('modal-relacao');
        modalRelacao.style.display = 'flex';

        modalRelacao.dataset.alunoId = alunoId;

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

    //FORM RELAÇÃO
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
            const { data: relacaoExistente, error: erroVerificacao } = await supabaseClient
                .from('professor_aluno')
                .select('*')
                .eq('professor_id', professorId)
                .eq('aluno_id', alunoId)
                .single();

            if (erroVerificacao) {
                console.error('Erro ao verificar relação existente:', erroVerificacao);
                alert('Erro ao verificar relação existente.');
                return;
            }

            if (relacaoExistente) {
                alert('Já existe uma relação entre este professor e aluno.');
                return;
            }

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


    const closeModalRelacao = document.querySelector('#modal-relacao .close');
    closeModalRelacao.addEventListener('click', () => {
        document.getElementById('modal-relacao').style.display = 'none';
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('adicionar-relacao')) {
            mostrarModalAdicionarRelacao(event.target);
        }
    });
    carregarAlunos();




    // PROFESSORES
    const listaProfessores = document.getElementById("lista-professores");

    async function carregarProfessores() {
        const { data, error } = await supabaseClient
            .from("responsaveis")
            .select("id, nome, foto_perfil, email")
            .eq("tipo", "professor");

        if (error) {
            console.error("Erro ao carregar professores:", error);
            listaProfessores.innerHTML = `<p class="erro">Erro ao carregar professores.</p>`;
            return;
        }

        listaProfessores.innerHTML = "";

        if (data.length === 0) {
            listaProfessores.innerHTML = `<p class="vazio">Nenhum professor encontrado.</p>`;
            return;
        }

        // Exibe os professores
        data.forEach((professor) => {
            const professorCard = document.createElement("div");
            professorCard.className = "professor-card";
            professorCard.dataset.professorId = professor.id;
            professorCard.innerHTML = `
            <img src="${professor.foto_perfil}" alt="Foto de ${professor.nome}">
            <h3>${professor.nome}</h3>
            <p>${professor.email}</p>
            <div class="menu-aluno">
                    <button class="menu-button">...</button>
                    <div class="menu-options">
                        <button class="excluir-professor">Excluir</button>
                    </div>
                </div>
        `;

            listaProfessores.appendChild(professorCard);
        });
    }


    carregarProfessores();


    document.getElementById("pesquisa-professor").addEventListener("input", async (e) => {
        const termo = e.target.value.toLowerCase();

        const { data, error } = await supabaseClient
            .from("responsaveis")
            .select("*")
            .eq("tipo", "professor")
            .ilike("nome", `%${termo}%`);

        if (error) {
            console.error("Erro ao buscar professores:", error);
            return;
        }

        listaProfessores.innerHTML = "";
        data.forEach((professor) => {
            const professorCard = document.createElement("div");
            professorCard.className = "professor-card";
            professorCard.dataset.professorId = professor.id;
            professorCard.innerHTML = `
        <img src="${professor.foto_perfil}" alt="Foto de ${professor.nome}">
            <h3>${professor.nome}</h3>
            <p>${professor.email}</p>
            <div class="menu-aluno">
                    <button class="menu-button">...</button>
                    <div class="menu-options">
                        <button class="excluir-professor">Excluir</button>
                    </div>
                </div>
      `;
            listaProfessores.appendChild(professorCard);
        });
    });

    const btnAdicionarProfessor = document.getElementById('btn-adicionar-professor');
    const modalProfessor = document.getElementById('modal-adicionar-professor');
    const closeModalProfessor = modalProfessor.querySelector('.close');

    btnAdicionarProfessor.addEventListener('click', () => {
        modalProfessor.style.display = 'flex';
    });

    closeModalProfessor.addEventListener('click', () => {
        modalProfessor.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalProfessor) {
            modalProfessor.style.display = 'none';
        }
    });

    const formProfessor = document.getElementById('form-professor');

    formProfessor.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome-professor').value;
        const email = document.getElementById('email-professor').value;
        const senha = document.getElementById('senha-professor').value;

        const { data, error } = await supabaseClient
            .from('responsaveis')
            .insert([{ nome, email, senha, tipo: 'professor' }]);

        if (error) {
            console.error('Erro ao adicionar professor:', error);
            alert('Erro ao adicionar professor. Tente novamente.');
            return;
        }

        alert('Professor adicionado com sucesso!');
        formProfessor.reset();
        modalProfessor.style.display = 'none';
        carregarProfessores();
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('excluir-professor')) {
            const confirmacao = confirm('Tem certeza que deseja excluir este professor?');
            if (confirmacao) {
                excluirProfessor(event.target);
            }
        }
    });

    async function excluirProfessor(button) {
        const professorCard = button.closest('.professor-card');
        const professorId = professorCard ? professorCard.dataset.professorId : null;

        if (!professorId) {
            console.error('Professor ID não encontrado');
            return;
        }

        const { error } = await supabaseClient
            .from('responsaveis')
            .delete()
            .eq('id', professorId);

        if (error) {
            alert(`Erro ao excluir professor: ${error.message}`);
        } else {
            alert('Professor excluído com sucesso!');
            carregarProfessores();
        }
    }



    // RESPONSÁVEIS
    const listaResponsaveis = document.getElementById("lista-responsaveis");

    async function carregarResponsaveis() {
        const { data, error } = await supabaseClient
            .from("responsaveis")
            .select(`
                id,
                nome,
                foto_perfil,
                email,
                aluno_id,
                alunos (nome)
            `)
            .eq("tipo", "responsável");

        if (error) {
            console.error("Erro ao carregar responsáveis:", error);
            listaResponsaveis.innerHTML = `<p class="erro">Erro ao carregar responsáveis.</p>`;
            return;
        }

        listaResponsaveis.innerHTML = "";

        if (data.length === 0) {
            listaResponsaveis.innerHTML = `<p class="vazio">Nenhum responsável encontrado.</p>`;
            return;
        }

        data.forEach((responsavel) => {
            const alunoNome = responsavel.alunos?.nome || "Não associado";
            const responsavelCard = document.createElement("div");
            responsavelCard.className = "responsavel-card";
            responsavelCard.dataset.responsavelId = responsavel.id;
            responsavelCard.innerHTML = `
                <div>
                    <h3>${responsavel.nome}</h3>
                    <p>${responsavel.email}</p>
                </div>
                <div>
                    <p><span>Aluno(a): </span>${alunoNome}</p>
                </div>
                <div class="menu-responsavel">
                    <button class="menu-button">...</button>
                    <div class="menu-options">
                        <button class="excluir-responsavel">Excluir</button>
                    </div>
                </div>
            `;
            listaResponsaveis.appendChild(responsavelCard);
        });
    }
    carregarResponsaveis();


    document.getElementById("pesquisa-responsavel").addEventListener("input", async (e) => {
        const termo = e.target.value.toLowerCase();

        const { data, error } = await supabaseClient
            .from("responsaveis")
            .select("id, nome, foto_perfil, email, aluno_id, alunos(nome)")
            .eq("tipo", "responsável")
            .ilike("nome", `%${termo}%`);

        if (error) {
            console.error("Erro ao buscar responsáveis:", error);
            return;
        }

        listaResponsaveis.innerHTML = "";
        data.forEach((responsavel) => {
            const responsavelCard = document.createElement("div");
            responsavelCard.className = "responsavel-card";
            responsavelCard.dataset.responsavelId = responsavel.id;
            responsavelCard.innerHTML = `
                <div>
                    <h3>${responsavel.nome}</h3>
                    <p>${responsavel.email}</p>
                </div>
                <div>
                    <p><span>Aluno(a): </span>${responsavel.alunos?.nome || "Não associado"}</p>
                </div>
                <div class="menu-aluno">
                    <button class="menu-button">...</button>
                    <div class="menu-options">
                        <button class="excluir-responsavel">Excluir</button>
                    </div>
                </div>
            `;
            listaResponsaveis.appendChild(responsavelCard);
        });
    });


    const btnAdicionarPResponsavel = document.getElementById('btn-adicionar-responsavel');
    const modalResponsavel = document.getElementById('modal-adicionar-responsavel');
    const closeModalResponsavel = modalResponsavel.querySelector('.close');

    btnAdicionarPResponsavel.addEventListener('click', () => {
        modalResponsavel.style.display = 'flex';
    });

    closeModalResponsavel.addEventListener('click', () => {
        modalResponsavel.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalResponsavel) {
            modalResponsavel.style.display = 'none';
        }
    });

    const formResponsavel = document.getElementById('form-responsavel');

    formResponsavel.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nome = document.getElementById("nome-responsavel").value;
        const email = document.getElementById("email-responsavel").value;
        const senha = document.getElementById("senha-responsavel").value;
        const alunoId = selectAluno.value;

        if (!alunoId) {
            alert("Selecione um aluno para associar ao responsável.");
            return;
        }

        const { data, error } = await supabaseClient
            .from("responsaveis")
            .insert([{ nome, email, senha, tipo: "responsável", aluno_id: alunoId }]);

        if (error) {
            console.error("Erro ao adicionar responsável:", error);
            alert("Erro ao adicionar responsável. Tente novamente.");
            return;
        }

        alert("Responsável adicionado com sucesso!");
        formResponsavel.reset();
        modalResponsavel.style.display = "none";
        carregarResponsaveis();
    });

    const selectAluno = document.getElementById("aluno-responsavel");

    async function carregarAlunos2() {
        const { data, error } = await supabaseClient
            .from("alunos")
            .select("id, nome");

        if (error) {
            console.error("Erro ao carregar alunos:", error);
            selectAluno.innerHTML = `<option value="">Erro ao carregar alunos</option>`;
            return;
        }

        selectAluno.innerHTML = `<option value="" disabled selected>Selecione um aluno</option>`;

        data.forEach((aluno) => {
            const option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = aluno.nome;
            selectAluno.appendChild(option);
        });
    } carregarAlunos2();

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('excluir-responsavel')) {
            const confirmacao = confirm('Tem certeza que deseja excluir este responsável?');
            if (confirmacao) {
                excluirResponsavel(event.target);
            }
        }
    });

    async function excluirResponsavel(button) {
        const responsavelCard = button.closest('.responsavel-card');
        const responsavelId = responsavelCard ? responsavelCard.dataset.responsavelId : null;

        if (!responsavelId) {
            console.error('Responsável ID não encontrado');
            return;
        }

        const { error } = await supabaseClient
            .from('responsaveis')
            .delete()
            .eq('id', responsavelId);

        if (error) {
            alert(`Erro ao excluir responsável: ${error.message}`);
        } else {
            alert('Responsável excluído com sucesso!');
            carregarResponsaveis();
        }
    }



});
